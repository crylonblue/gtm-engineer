"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getToolIcon } from "@/lib/tool-icons";

interface ToolCall {
  id: string;
  name: string;
  args: string;
  status: "pending" | "running" | "complete" | "error";
  result?: string;
}

interface ToolCallItemProps {
  toolCall: ToolCall;
}

function humanize(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (s) => s.toUpperCase());
}

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function tryParseArray(str: string): Record<string, unknown>[] | null {
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
      return parsed as Record<string, unknown>[];
    }
  } catch {
    // not valid JSON
  }
  return null;
}

function SimpleTable({ data }: { data: Record<string, unknown>[] }) {
  const keys = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto border mt-2">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {keys.map((key) => (
              <th
                key={key}
                className="px-4 py-2 text-left font-medium text-muted-foreground"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {keys.map((key) => (
                <td key={key} className="px-4 py-2 border-t">
                  {String(row[key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: ToolCall["status"] }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <span className="size-1.5 rounded-full bg-current animate-pulse" />
          Pending
        </Badge>
      );
    case "running":
      return (
        <Badge variant="secondary" className="gap-1">
          <Loader2 className="size-3 animate-spin" />
          Running
        </Badge>
      );
    case "complete":
      return (
        <Badge variant="outline" className="gap-1">
          <Check className="size-3" />
          Complete
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <X className="size-3" />
          Error
        </Badge>
      );
  }
}

export function ToolCallItem({ toolCall }: ToolCallItemProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getToolIcon(toolCall.name);
  const arrayData = toolCall.result ? tryParseArray(toolCall.result) : null;

  return (
    <div className="border transition-all duration-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
      >
        <Icon size={14} className="text-muted-foreground shrink-0" />
        <span className="font-medium">{humanize(toolCall.name)}</span>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={toolCall.status} />
          <ChevronDown
            size={14}
            className={`text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`grid transition-all duration-200 ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Arguments
              </p>
              <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto">
                {formatJson(toolCall.args)}
              </pre>
            </div>

            {toolCall.result && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Result
                </p>
                {arrayData ? (
                  <SimpleTable data={arrayData} />
                ) : (
                  <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto">
                    {formatJson(toolCall.result)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
