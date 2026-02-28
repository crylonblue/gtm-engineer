"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, File, FileText, FolderOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileViewer } from "@/components/storage/file-viewer";

function getFileIcon(key: string) {
  if (key.endsWith(".csv")) return <FileText size={14} className="text-green-500 shrink-0" />;
  if (key.endsWith(".json")) return <File size={14} className="text-blue-500 shrink-0" />;
  return <File size={14} className="text-muted-foreground shrink-0" />;
}

function getFileTypeBadge(key: string) {
  if (key.endsWith(".csv")) return <Badge variant="outline" className="text-[10px] px-1 py-0">CSV</Badge>;
  if (key.endsWith(".json")) return <Badge variant="outline" className="text-[10px] px-1 py-0">JSON</Badge>;
  if (key.endsWith(".txt")) return <Badge variant="outline" className="text-[10px] px-1 py-0">TXT</Badge>;
  return null;
}

export default function StoragePage() {
  const [prefix, setPrefix] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<unknown>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch(
        `/api/storage/list?prefix=${encodeURIComponent(prefix)}`,
      );
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch (err) {
      console.error("Failed to list storage keys:", err);
      setKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  }, [prefix]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const fetchFile = useCallback(async (key: string) => {
    setSelectedKey(key);
    setLoadingFile(true);
    setFileContent(null);
    try {
      const res = await fetch(
        `/api/storage/get?key=${encodeURIComponent(key)}`,
      );
      const data = await res.json();
      setFileContent(data.content);
    } catch (err) {
      console.error("Failed to fetch file:", err);
      setFileContent(`Error loading file: ${err}`);
    } finally {
      setLoadingFile(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold">Storage</h1>
          <Badge variant="secondary" className="text-xs">
            {keys.length} files
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={fetchKeys} disabled={loadingKeys}>
          <RefreshCw size={14} className={loadingKeys ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: file list */}
        <div className="w-80 border-r flex flex-col shrink-0">
          <div className="p-3 border-b">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Filter by prefix..."
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingKeys ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : keys.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No files found
              </div>
            ) : (
              <div className="p-1">
                {keys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => fetchFile(key)}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-left hover:bg-muted/50 transition-colors ${
                      selectedKey === key ? "bg-muted" : ""
                    }`}
                  >
                    {getFileIcon(key)}
                    <span className="truncate flex-1 font-mono text-xs">
                      {key}
                    </span>
                    {getFileTypeBadge(key)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: file viewer */}
        <div className="flex-1 min-w-0 overflow-auto">
          {selectedKey === null ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Select a file to view its contents
            </div>
          ) : loadingFile ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {getFileIcon(selectedKey)}
                <span className="font-mono text-sm font-medium">{selectedKey}</span>
                {getFileTypeBadge(selectedKey)}
              </div>
              <FileViewer content={fileContent} maxHeight="calc(100vh - 250px)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
