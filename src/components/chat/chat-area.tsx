"use client";

import { useEffect, useRef } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { useChatStream } from "@/hooks/use-chat-stream";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";

interface ChatAreaProps {
  conversationId: Id<"conversations"> | null;
  onNewChat: () => void;
}

export function ChatArea({ conversationId, onNewChat }: ChatAreaProps) {
  const { messages, isGenerating, sendMessage, stopGenerating } =
    useChatStream(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <EmptyState />
        </div>
      </div>
    );
  }

  const handleSend = async (text: string) => {
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
