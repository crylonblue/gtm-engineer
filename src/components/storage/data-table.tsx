"use client";

import { useState } from "react";

type SortDir = "asc" | "desc" | null;

function isNumeric(v: unknown): v is number {
  return typeof v === "number" || (typeof v === "string" && v !== "" && !isNaN(Number(v)));
}

interface DataTableProps {
  data: Record<string, unknown>[];
  maxHeight?: string;
}

export function DataTable({ data, maxHeight = "400px" }: DataTableProps) {
  const keys = Object.keys(data[0] ?? {});
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (key: string) => {
    let nextDir: SortDir;
    if (sortCol !== key) {
      nextDir = "asc";
    } else if (sortDir === "asc") {
      nextDir = "desc";
    } else {
      nextDir = null;
    }
    setSortCol(nextDir === null ? null : key);
    setSortDir(nextDir);
  };

  const displayed =
    sortCol && sortDir
      ? [...data].sort((a, b) => {
          const va = a[sortCol];
          const vb = b[sortCol];
          if (isNumeric(va) && isNumeric(vb)) {
            return sortDir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
          }
          return sortDir === "asc"
            ? String(va ?? "").localeCompare(String(vb ?? ""))
            : String(vb ?? "").localeCompare(String(va ?? ""));
        })
      : data;

  const sortIndicator = (key: string) => {
    if (sortCol !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="overflow-auto border" style={{ maxHeight }}>
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50 sticky top-0 z-10">
          <tr>
            {keys.map((key) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:bg-muted/80"
              >
                {key}
                {sortIndicator(key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, i) => (
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
