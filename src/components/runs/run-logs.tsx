"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { RunSummary } from "./run-summary";
import { WorkItemQueue } from "./work-item-queue";
import { RunChatHistory } from "./run-chat-history";

export function RunLogs({ agentId }: { agentId: Id<"agents"> }) {
  const runs = useQuery(api.runs.list, { agentId });
  const [selectedRunId, setSelectedRunId] = useState<Id<"runs"> | null>(null);

  const activeRunId = selectedRunId ?? (runs && runs.length > 0 ? runs[0]._id : null);

  const workItems = useQuery(
    api.workItems.listByRun,
    activeRunId ? { runId: activeRunId } : "skip"
  );
  const runMessages = useQuery(
    api.runMessages.listByRun,
    activeRunId ? { runId: activeRunId } : "skip"
  );

  if (runs === undefined) {
    return (
      <div className="text-sm text-muted-foreground py-8">Loading runs...</div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-8">
        No runs yet. Trigger a run to see logs here.
      </div>
    );
  }

  const activeRun = runs.find((r) => r._id === activeRunId)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Run</label>
        <select
          className="border-input dark:bg-input/30 h-9 rounded-none border bg-transparent px-3 text-sm"
          value={activeRunId ?? ""}
          onChange={(e) => setSelectedRunId(e.target.value as Id<"runs">)}
        >
          {runs.map((run) => (
            <option key={run._id} value={run._id}>
              {new Date(run.startedAt).toLocaleString()} — {run.status}
            </option>
          ))}
        </select>
      </div>

      {activeRun && <RunSummary run={activeRun} />}
      {workItems && <WorkItemQueue items={workItems as any} />}
      {runMessages && <RunChatHistory messages={runMessages as any} />}
    </div>
  );
}
