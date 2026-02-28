"use client";

import { useEffect, useRef, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useChatStream } from "@/hooks/use-chat-stream";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";

interface ChatAreaProps {
  conversationId: Id<"conversations"> | null;
  onNewChat: () => Promise<void> | void;
}

export function ChatArea({ conversationId, onNewChat }: ChatAreaProps) {
  const { messages, isGenerating, sendMessage, stopGenerating } =
    useChatStream(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // When conversation is created and we have a pending message, send it
  useEffect(() => {
    if (conversationId && pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      sendMessage(msg);
    }
  }, [conversationId, pendingMessage, sendMessage]);

  const handleSend = async (text: string) => {
    if (!conversationId) {
      // Create conversation first, then send once it's ready
      setPendingMessage(text);
      await onNewChat();
      return;
    }
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && !isGenerating && (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Send a message to start the conversation.
          </div>
        )}
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}
      </div>
      <ChatInput
        onSend={handleSend}
        isGenerating={isGenerating}
        onStop={stopGenerating}
      />
    </div>
  );
}
