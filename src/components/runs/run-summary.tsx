"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

type Run = {
  status: "running" | "completed" | "failed";
  phase: string;
  trigger: "schedule" | "manual";
  startedAt: number;
  endedAt?: number;
  tasks: number;
  discovered: number;
  processed: number;
  failed: number;
  skipped: number;
};

function statusVariant(status: string) {
  if (status === "completed") return "secondary" as const;
  if (status === "failed") return "destructive" as const;
  return "default" as const;
}

function statusClass(status: string) {
  if (status === "completed") return "bg-green-600 text-white border-transparent";
  if (status === "running") return "bg-yellow-600 text-white border-transparent";
  return "";
}

export function RunSummary({ run }: { run: Run }) {
  const fields = [
    ["Phase", run.phase],
    ["Trigger", run.trigger],
    ["Started", timeAgo(run.startedAt)],
    ["Ended", run.endedAt ? timeAgo(run.endedAt) : "—"],
    ["Tasks", run.tasks],
    ["Discovered", run.discovered],
    ["Processed", run.processed],
    ["Failed", run.failed],
    ["Skipped", run.skipped],
  ] as const;

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Run Summary
          <Badge
            variant={statusVariant(run.status)}
            className={statusClass(run.status)}
          >
            {run.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{String(value)}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
