"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ToolCall = {
  id: string;
  name: string;
  args: string;
  status: string;
  result?: string;
};

type RunMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: number;
};

export function RunChatHistory({ messages }: { messages: RunMessage[] }) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Chat History (includes tool calls)</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages.</p>
        ) : (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg._id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={msg.role === "user" ? "secondary" : "default"}>
                    {msg.role === "user" ? "User" : "Assistant"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.toolCalls?.map((tc) => (
                  <pre
                    key={tc.id}
                    className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs"
                  >
                    {JSON.stringify(tc, null, 2)}
                  </pre>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
