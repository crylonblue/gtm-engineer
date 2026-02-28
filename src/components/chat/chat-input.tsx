"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { SendHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  onStop: () => void;
}

export function ChatInput({ onSend, isGenerating, onStop }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setValue("");
  }, [value, isGenerating, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a message..."
          disabled={isGenerating}
          className="min-h-10 max-h-40 overflow-y-auto resize-none"
        />
        {isGenerating ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={onStop}
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!value.trim()}
          >
            <SendHorizontal className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
