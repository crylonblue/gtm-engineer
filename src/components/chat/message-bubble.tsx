"use client";

import { Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { MessageContent } from "@/components/chat/message-content";
import { ToolCallItem } from "@/components/chat/tool-call-item";
import { MessageSkeleton } from "@/components/chat/message-skeleton";

interface ToolCall {
  id: string;
  name: string;
  args: string;
  status: "pending" | "running" | "complete" | "error";
  result?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Heartbeat indicator
  if (message.role === "user" && message.content === "__heartbeat__") {
    return (
      <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
        <div className="flex-1 border-t border-border" />
        <Activity size={12} className="text-muted-foreground" />
        <span>Heartbeat</span>
        <div className="flex-1 border-t border-border" />
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground max-w-[80%] px-4 py-2.5">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar className="size-6 rounded-none shrink-0 mt-0.5">
        <AvatarFallback className="rounded-none bg-primary text-primary-foreground text-xs">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-3">
        {message.isStreaming && !message.content && !message.toolCalls?.length ? (
          <MessageSkeleton />
        ) : (
          <>
            {message.content && (
              <div className={cn(message.isStreaming && "typing-cursor")}>
                <MessageContent content={message.content} />
              </div>
            )}

            {message.toolCalls?.map((toolCall) => (
              <ToolCallItem key={toolCall.id} toolCall={toolCall} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
