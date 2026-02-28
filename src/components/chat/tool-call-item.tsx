"use client";

import { createElement, useState } from "react";
import { Check, ChevronDown, File, FileText, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getToolIcon } from "@/lib/tool-icons";
import { DataTable } from "@/components/storage/data-table";
import { FileViewer } from "@/components/storage/file-viewer";

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
    .replace(/_/g, " ")
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

function tryParseJson(str: string): unknown | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function getFileIcon(key: string) {
  if (key.endsWith(".csv")) return <FileText size={12} className="text-green-500" />;
  if (key.endsWith(".json")) return <File size={12} className="text-blue-500" />;
  return <File size={12} className="text-muted-foreground" />;
}

/* ── Storage-specific result renderers ── */

function StorageGetResult({ result }: { result: unknown }) {
  if (typeof result !== "object" || result === null) return null;
  const data = result as Record<string, unknown>;
  if (!data.data || typeof data.data !== "object") return null;
  const inner = data.data as Record<string, unknown>;
  const content = inner.content;
  const key = typeof inner.key === "string" ? inner.key : null;

  return (
    <div>
      {key && (
        <Badge variant="outline" className="mb-2 font-mono text-xs">
          {key}
        </Badge>
      )}
      <FileViewer content={content} maxHeight="300px" />
    </div>
  );
}

function StorageSaveResult({ result }: { result: unknown }) {
  if (typeof result !== "object" || result === null) return null;
  const data = result as Record<string, unknown>;
  const inner = (data.data ?? data) as Record<string, unknown>;
  const key = inner.key;

  return (
    <div className="flex items-center gap-2 py-1">
      <Check size={14} className="text-green-500" />
      <span className="text-sm">Saved to</span>
      <Badge variant="outline" className="font-mono text-xs">
        {String(key ?? "storage")}
      </Badge>
    </div>
  );
}

function StorageListResult({ result }: { result: unknown }) {
  if (typeof result !== "object" || result === null) return null;
  const data = result as Record<string, unknown>;
  const inner = (data.data ?? data) as Record<string, unknown>;
  const keys = inner.keys;
  if (!Array.isArray(keys)) return null;

  return (
    <div className="space-y-1">
      {keys.map((key: string) => (
        <div key={key} className="flex items-center gap-2 text-xs font-mono">
          {getFileIcon(key)}
          {key}
        </div>
      ))}
      {keys.length === 0 && (
        <p className="text-xs text-muted-foreground">No files found</p>
      )}
    </div>
  );
}

function ToolIcon({ name }: { name: string }) {
  return createElement(getToolIcon(name), { size: 14, className: "text-muted-foreground shrink-0" });
}

/* ── Status badge ── */

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

/* ── Result renderer ── */

function ResultDisplay({ toolName, result }: { toolName: string; result: string }) {
  const parsed = tryParseJson(result);

  // Storage-specific renderers
  if (toolName === "storage_get" && parsed) {
    return <StorageGetResult result={parsed} />;
  }
  if (toolName === "storage_save" && parsed) {
    return <StorageSaveResult result={parsed} />;
  }
  if (toolName === "storage_list" && parsed) {
    return <StorageListResult result={parsed} />;
  }

  // Generic array → DataTable
  const arrayData = tryParseArray(result);
  if (arrayData) {
    return <DataTable data={arrayData} maxHeight="300px" />;
  }

  // Fallback: formatted JSON / raw text
  return (
    <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto">
      {formatJson(result)}
    </pre>
  );
}

/* ── Main component ── */

export function ToolCallItem({ toolCall }: ToolCallItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border transition-all duration-200">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
      >
        <ToolIcon name={toolCall.name} />
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
                <ResultDisplay toolName={toolCall.name} result={toolCall.result} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
