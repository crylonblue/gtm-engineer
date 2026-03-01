"use client";

import { useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  fileName?: string;
  maxHeight?: string;
  onSave?: (csv: string) => Promise<void>;
}

export function FileViewer({ content, fileName, maxHeight, onSave }: FileViewerProps) {
  const [dirty, setDirty] = useState(false);
  const [latestCsv, setLatestCsv] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCsvChange = useCallback((csv: string) => {
    setLatestCsv(csv);
    setDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!onSave || !latestCsv) return;
    setSaving(true);
    try {
      await onSave(latestCsv);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [onSave, latestCsv]);

  const isCsv =
    typeof content === "string" &&
    (fileName?.endsWith(".csv") || looksLikeCsv(content));

  // String content — check CSV first, then JSON array
  if (typeof content === "string") {
    if (isCsv) {
      return (
        <div>
          {onSave && (
            <div className="flex items-center gap-2 mb-3">
              <Button
                variant={dirty ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
                disabled={!dirty || saving}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : "Save"}
              </Button>
              {dirty && (
                <span className="text-xs text-muted-foreground">
                  Unsaved changes
                </span>
              )}
            </div>
          )}
          <CsvTable csv={content} onChange={handleCsvChange} maxHeight={maxHeight} />
        </div>
      );
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
