"use client";

import { CsvTable } from "./csv-table";
import { DataTable } from "./data-table";

/** Heuristic: 2+ lines, 80%+ of lines have the same comma count */
function looksLikeCsv(text: string): boolean {
  const lines = text.trim().split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return false;
  const counts = lines.map((l) => (l.match(/,/g) ?? []).length);
  if (counts[0] === 0) return false;
  const target = counts[0];
  const matching = counts.filter((c) => c === target).length;
  return matching / counts.length >= 0.8;
}

function tryParseJsonArray(content: unknown): Record<string, unknown>[] | null {
  let data: unknown = content;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === "object" &&
    data[0] !== null
  ) {
    return data as Record<string, unknown>[];
  }
  return null;
}

interface FileViewerProps {
  content: unknown;
  maxHeight?: string;
}

export function FileViewer({ content, maxHeight }: FileViewerProps) {
  // String content — check CSV first, then JSON array
  if (typeof content === "string") {
    if (looksLikeCsv(content)) {
      return <CsvTable csv={content} maxHeight={maxHeight} />;
    }
    const arr = tryParseJsonArray(content);
    if (arr) {
      return <DataTable data={arr} maxHeight={maxHeight} />;
    }
    return (
      <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
        {content}
      </pre>
    );
  }

  // Non-string content — check JSON array, then pretty-print
  const arr = tryParseJsonArray(content);
  if (arr) {
    return <DataTable data={arr} maxHeight={maxHeight} />;
  }

  return (
    <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}
