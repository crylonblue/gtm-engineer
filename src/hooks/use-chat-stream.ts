"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3001";

interface ToolCall {
  id: string;
  name: string;
  args: string;
  status: "pending" | "running" | "complete" | "error";
  result?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export function useChatStream(conversationId: Id<"conversations"> | null) {
  const messages = useQuery(
    api.messages.list,
    conversationId ? { conversationId } : "skip"
  );

  const saveMessage = useMutation(api.messages.save);
  const updateMessage = useMutation(api.messages.update);
  const updateTitle = useMutation(api.conversations.updateTitle);
  const isFirstMessageRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) return;

      // Save user message to Convex
      await saveMessage({
        conversationId,
        role: "user",
        content: text,
      });

      // Auto-title from first message
      if (isFirstMessageRef.current) {
        isFirstMessageRef.current = false;
        const title = text.length > 50 ? text.slice(0, 50) + "..." : text;
        await updateTitle({ id: conversationId, title });
      }

      // Build messages array from conversation history
      const history = (messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      history.push({ role: "user", content: text });

      // Create placeholder assistant message
      const assistantMsgId = await saveMessage({
        conversationId,
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      setIsGenerating(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch(`${AGENT_URL}/api/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            stream: true,
            messages: history,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Agent service error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (
                  parsed.type === "content_block_delta" &&
                  parsed.delta?.type === "text_delta" &&
                  parsed.delta?.text
                ) {
                  accumulated += parsed.delta.text;
                  await updateMessage({
                    id: assistantMsgId,
                    content: accumulated,
                  });
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }

        // Finalize
        await updateMessage({
          id: assistantMsgId,
          content: accumulated,
          isStreaming: false,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          await updateMessage({
            id: assistantMsgId,
            isStreaming: false,
          });
        } else {
          const errorMsg =
            err instanceof Error ? err.message : "Stream failed";
          await updateMessage({
            id: assistantMsgId,
            content: `⚠️ Error: ${errorMsg}`,
            isStreaming: false,
          });
        }
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [conversationId, messages, saveMessage, updateMessage, updateTitle]
  );

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const allMessages: ChatMessage[] = (messages ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
    toolCalls: m.toolCalls as ToolCall[] | undefined,
    isStreaming: m.isStreaming ?? undefined,
  }));

  return {
    messages: allMessages,
    isGenerating,
    sendMessage,
    stopGenerating,
  };
}
