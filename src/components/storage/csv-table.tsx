"use client";

import { useState, useCallback, useRef } from "react";

/* ── Inline CSV parser (handles quoted fields) ── */

function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i++) {
    const ch = csv[i];
    if (inQuotes) {
      if (ch === '"' && csv[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || (ch === "\r" && csv[i + 1] === "\n")) {
        row.push(field);
        field = "";
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        field += ch;
      }
    }
  }
  // last field / row
  row.push(field);
  if (row.some((c) => c !== "")) rows.push(row);

  return rows;
}

/** Escape a single CSV field (wrap in quotes if it contains comma, quote, or newline) */
function escapeCsvField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return '"' + field.replace(/"/g, '""') + '"';
  }
  return field;
}

function rowsToCsv(headers: string[], data: string[][]): string {
  const lines = [headers, ...data].map((row) =>
    row.map(escapeCsvField).join(",")
  );
  return lines.join("\n");
}

/* ── Sorting ── */

type SortDir = "asc" | "desc" | null;

function isNumeric(v: string) {
  return v !== "" && !isNaN(Number(v));
}

function sortRows(rows: string[][], colIdx: number, dir: SortDir): string[][] {
  if (dir === null) return rows;
  return [...rows].sort((a, b) => {
    const va = a[colIdx] ?? "";
    const vb = b[colIdx] ?? "";
    if (isNumeric(va) && isNumeric(vb)) {
      return dir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    }
    return dir === "asc"
      ? va.localeCompare(vb)
      : vb.localeCompare(va);
  });
}

/* ── Component ── */

interface CsvTableProps {
  csv: string;
  onEdit?: (row: number, col: number, value: string) => void;
  onChange?: (csv: string) => void;
  maxHeight?: string;
}

export function CsvTable({ csv, onEdit, onChange, maxHeight = "400px" }: CsvTableProps) {
  const parsed = parseCsv(csv);
  if (parsed.length < 2) {
    return <pre className="bg-muted p-3 text-xs font-mono overflow-x-auto">{csv}</pre>;
  }

  const editable = !!(onEdit || onChange);
  const headers = parsed[0];
  const colCount = headers.length;
  const [dataRows, setDataRows] = useState(() => parsed.slice(1));
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = (colIdx: number) => {
    let nextDir: SortDir;
    if (sortCol !== colIdx) {
      nextDir = "asc";
    } else if (sortDir === "asc") {
      nextDir = "desc";
    } else {
      nextDir = null;
    }
    setSortCol(nextDir === null ? null : colIdx);
    setSortDir(nextDir);
  };

  const displayed = sortCol !== null ? sortRows(dataRows, sortCol, sortDir) : dataRows;

  const startEdit = useCallback(
    (r: number, c: number) => {
      if (!editable) return;
      setEditing({ r, c });
      setEditValue(dataRows[r][c] ?? "");
    },
    [dataRows, editable],
  );

  const emitChange = useCallback(
    (updated: string[][]) => {
      if (onChange) {
        onChange(rowsToCsv(headers, updated));
      }
    },
    [headers, onChange],
  );

  const commitEdit = useCallback(() => {
    if (!editing) return;
    const { r, c } = editing;
    if (dataRows[r][c] === editValue) {
      setEditing(null);
      return;
    }
    const updated = dataRows.map((row) => [...row]);
    updated[r][c] = editValue;
    setDataRows(updated);
    onEdit?.(r, c, editValue);
    emitChange(updated);
    setEditing(null);
  }, [editing, editValue, dataRows, onEdit, emitChange]);

  const commitAndMove = useCallback(
    (dr: number, dc: number) => {
      if (!editing) return;
      // Commit current cell
      const { r, c } = editing;
      const updated = dataRows.map((row) => [...row]);
      if (updated[r][c] !== editValue) {
        updated[r][c] = editValue;
        setDataRows(updated);
        onEdit?.(r, c, editValue);
        emitChange(updated);
      }
      // Move to next cell
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < updated.length && nc >= 0 && nc < colCount) {
        setEditing({ r: nr, c: nc });
        setEditValue(updated[nr][nc] ?? "");
      } else {
        setEditing(null);
      }
    },
    [editing, editValue, dataRows, colCount, onEdit, emitChange],
  );

  const cancelEdit = useCallback(() => setEditing(null), []);

  const sortIndicator = (colIdx: number) => {
    if (sortCol !== colIdx) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="overflow-auto border" style={{ maxHeight }}>
      <table ref={tableRef} className="w-full text-sm">
        <thead className="border-b bg-muted/50 sticky top-0 z-10">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                onClick={() => handleSort(i)}
                className="px-4 py-2 text-left font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:bg-muted/80"
              >
                {h}
                {sortIndicator(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row, ri) => (
            <tr key={ri} className="group">
              {row.map((cell, ci) => {
                const isEditing = editing?.r === ri && editing?.c === ci;
                return (
                  <td
                    key={ci}
                    className={`px-4 py-2 border-t ${
                      editable && !isEditing
                        ? "cursor-text hover:bg-accent/40 transition-colors"
                        : ""
                    }`}
                    onClick={() => {
                      if (!isEditing) startEdit(ri, ci);
                    }}
                  >
                    {isEditing ? (
                      editValue.includes("\n") ? (
                        <textarea
                          className="w-full min-w-[200px] bg-background border border-primary/50 ring-1 ring-primary/20 px-1 py-0.5 text-xs font-mono rounded-sm outline-none resize-y"
                          rows={Math.min(editValue.split("\n").length + 1, 8)}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Tab") {
                              e.preventDefault();
                              commitAndMove(0, e.shiftKey ? -1 : 1);
                            } else if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <input
                          className="w-full bg-background border border-primary/50 ring-1 ring-primary/20 px-1 py-0.5 text-xs font-mono rounded-sm outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitAndMove(1, 0); // move down
                            } else if (e.key === "Tab") {
                              e.preventDefault();
                              commitAndMove(0, e.shiftKey ? -1 : 1);
                            } else if (e.key === "Escape") {
                              cancelEdit();
                            }
                          }}
                          autoFocus
                        />
                      )
                    ) : (
                      <span className={`${cell ? "whitespace-pre-wrap" : "text-muted-foreground/40 italic"}`}>
                        {cell || (editable ? "empty" : "")}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
