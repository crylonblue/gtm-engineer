"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

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
  const updateTitle = useMutation(api.conversations.updateTitle);
  const isFirstMessageRef = useRef(true);

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
    },
    [conversationId, saveMessage, updateTitle]
  );

  const stopGenerating = useCallback(() => {
    // Placeholder for future AI streaming abort
  }, []);

  const allMessages: ChatMessage[] = (messages ?? []).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
    toolCalls: m.toolCalls as ToolCall[] | undefined,
  }));

  return {
    messages: allMessages,
    isGenerating: false,
    sendMessage,
    stopGenerating,
  };
}
