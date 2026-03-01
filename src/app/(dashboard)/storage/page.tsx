"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback, useMemo } from "react";
import { RefreshCw, File, FileText, Folder, FolderOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface FolderEntry {
  type: "folder";
  name: string;
}

interface FileEntry {
  type: "file";
  name: string;
  fullKey: string;
}

type Entry = FolderEntry | FileEntry;

function deriveEntries(keys: string[], currentPath: string): Entry[] {
  const folders = new Set<string>();
  const files: FileEntry[] = [];

  for (const key of keys) {
    if (!key.startsWith(currentPath)) continue;
    const remainder = key.slice(currentPath.length);
    if (!remainder) continue;

    const slashIndex = remainder.indexOf("/");
    if (slashIndex !== -1) {
      folders.add(remainder.slice(0, slashIndex));
    } else {
      files.push({ type: "file", name: remainder, fullKey: key });
    }
  }

  const folderEntries: FolderEntry[] = [...folders]
    .sort()
    .map((name) => ({ type: "folder", name }));

  files.sort((a, b) => a.name.localeCompare(b.name));

  return [...folderEntries, ...files];
}

export default function StoragePage() {
  const [currentPath, setCurrentPath] = useState("");
  const [keys, setKeys] = useState<string[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<unknown>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch(
        `/api/storage/list?prefix=${encodeURIComponent(currentPath)}`,
      );
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch (err) {
      console.error("Failed to list storage keys:", err);
      setKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  }, [currentPath]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const entries = useMemo(() => deriveEntries(keys, currentPath), [keys, currentPath]);

  const breadcrumbSegments = useMemo(() => {
    if (!currentPath) return [];
    return currentPath.split("/").filter(Boolean);
  }, [currentPath]);

  const navigateToFolder = useCallback((folderName: string) => {
    setCurrentPath((prev) => prev + folderName + "/");
    setSelectedKey(null);
    setFileContent(null);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    if (index < 0) {
      setCurrentPath("");
    } else {
      const segments = currentPath.split("/").filter(Boolean);
      setCurrentPath(segments.slice(0, index + 1).join("/") + "/");
    }
    setSelectedKey(null);
    setFileContent(null);
  }, [currentPath]);

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

  const handleSave = useCallback(
    async (csv: string) => {
      if (!selectedKey) return;
      const res = await fetch("/api/storage/put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: selectedKey, content: csv }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
    },
    [selectedKey],
  );

  const fileCount = useMemo(() => entries.filter((e) => e.type === "file").length, [entries]);
  const folderCount = useMemo(() => entries.filter((e) => e.type === "folder").length, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <FolderOpen size={20} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold">Storage</h1>
          <Badge variant="secondary" className="text-xs">
            {folderCount > 0 && `${folderCount} folders, `}{fileCount} files
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
          {/* Breadcrumb */}
          <div className="p-3 border-b">
            <div className="flex items-center gap-1 text-sm flex-wrap">
              <button
                type="button"
                onClick={() => navigateToBreadcrumb(-1)}
                className={`hover:underline ${currentPath === "" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                root
              </button>
              {breadcrumbSegments.map((segment, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight size={12} className="text-muted-foreground shrink-0" />
                  <button
                    type="button"
                    onClick={() => navigateToBreadcrumb(i)}
                    className={`hover:underline truncate max-w-[120px] ${i === breadcrumbSegments.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                  >
                    {segment}
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingKeys ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {currentPath ? "Empty folder" : "No files found"}
              </div>
            ) : (
              <div className="p-1">
                {entries.map((entry) =>
                  entry.type === "folder" ? (
                    <button
                      key={`folder:${entry.name}`}
                      type="button"
                      onClick={() => navigateToFolder(entry.name)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-left hover:bg-muted/50 transition-colors"
                    >
                      <Folder size={14} className="text-yellow-500 shrink-0" />
                      <span className="truncate flex-1 font-mono text-xs">
                        {entry.name}/
                      </span>
                    </button>
                  ) : (
                    <button
                      key={entry.fullKey}
                      type="button"
                      onClick={() => fetchFile(entry.fullKey)}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-left hover:bg-muted/50 transition-colors ${
                        selectedKey === entry.fullKey ? "bg-muted" : ""
                      }`}
                    >
                      {getFileIcon(entry.name)}
                      <span className="truncate flex-1 font-mono text-xs">
                        {entry.name}
                      </span>
                      {getFileTypeBadge(entry.name)}
                    </button>
                  )
                )}
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
              <FileViewer content={fileContent} fileName={selectedKey} maxHeight="calc(100vh - 250px)" onSave={handleSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
