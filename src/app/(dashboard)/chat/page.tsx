"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { ChatArea } from "@/components/chat/chat-area";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = (searchParams.get("c") as Id<"conversations">) || null;

  const createConversation = useMutation(api.conversations.create);

  const handleNewChat = useCallback(async () => {
    const id = await createConversation({ title: "New conversation" });
    router.push(`/chat?c=${id}`);
  }, [createConversation, router]);

  return (
    <div className="h-[calc(100vh-3rem)] -m-4">
      <ChatArea conversationId={conversationId} onNewChat={handleNewChat} />
    </div>
  );
}
