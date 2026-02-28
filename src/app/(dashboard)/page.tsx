"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Bot,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Activity,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDuration(startedAt: number, completedAt?: number): string {
  if (!completedAt) return "...";
  const secs = Math.round((completedAt - startedAt) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}

function RunStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={14} className="text-green-500" />;
    case "failed":
      return <XCircle size={14} className="text-red-500" />;
    case "running":
      return <Loader2 size={14} className="text-blue-500 animate-spin" />;
    default:
      return <Activity size={14} className="text-muted-foreground" />;
  }
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card className="rounded-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const agents = useQuery(api.agents.list);
  const recentRuns = useQuery(api.runs.listRecent, { limit: 20 });
  const leadCount = useQuery(api.leads.count);

  const isLoading =
    agents === undefined ||
    recentRuns === undefined ||
    leadCount === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-none" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-none" />
      </div>
    );
  }

  // Agent stats
  const activeAgents = agents.filter((a) => a.status === "active").length;
  const pausedAgents = agents.filter((a) => a.status === "paused").length;

  // Run stats
  const now = Date.now();
  const last24h = recentRuns.filter((r) => now - r.startedAt < 86_400_000);
  const completedRuns = last24h.filter((r) => r.status === "completed").length;
  const failedRuns = last24h.filter((r) => r.status === "failed").length;
  const runningNow = recentRuns.filter((r) => r.status === "running").length;
  const successRate =
    last24h.length > 0
      ? Math.round((completedRuns / last24h.length) * 100)
      : null;

  // Build agent name lookup
  const agentMap = new Map<string, string>(agents.map((a) => [a._id as string, a.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <Link
          href="/agents"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all agents <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agents"
          value={agents.length}
          icon={<Bot size={28} />}
          sub={`${activeAgents} active, ${pausedAgents} paused`}
        />
        <StatCard
          label="Runs (24h)"
          value={last24h.length}
          icon={<Zap size={28} />}
          sub={
            runningNow > 0
              ? `${runningNow} running now`
              : completedRuns > 0
                ? `${completedRuns} completed`
                : "No runs yet"
          }
        />
        <StatCard
          label="Success Rate"
          value={successRate !== null ? `${successRate}%` : "-"}
          icon={<Activity size={28} />}
          sub={
            last24h.length > 0
              ? `${completedRuns} passed, ${failedRuns} failed`
              : "No data"
          }
        />
        <StatCard
          label="Leads"
          value={leadCount}
          icon={<Users size={28} />}
          sub="Total in database"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent overview */}
        <Card className="rounded-none lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Agents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No agents yet.{" "}
                <Link href="/agents/new" className="underline">
                  Create one
                </Link>
              </p>
            ) : (
              agents.map((agent) => (
                <Link
                  key={agent._id}
                  href={`/agents/${agent._id}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {agent.status === "active" ? (
                      <Play size={12} className="text-green-500 shrink-0" />
                    ) : (
                      <Pause size={12} className="text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">
                      {agent.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {agent.lastStatus && (
                      <RunStatusIcon status={agent.lastStatus} />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {agent.lastRunAt ? timeAgo(agent.lastRunAt) : "never"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent runs */}
        <Card className="rounded-none lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No runs yet. Trigger a run from an agent page.
              </p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left font-medium py-2 pr-4">
                        Agent
                      </th>
                      <th className="text-left font-medium py-2 pr-4">
                        Status
                      </th>
                      <th className="text-left font-medium py-2 pr-4">
                        Trigger
                      </th>
                      <th className="text-left font-medium py-2 pr-4">
                        Duration
                      </th>
                      <th className="text-left font-medium py-2 pr-4">
                        Tools
                      </th>
                      <th className="text-right font-medium py-2">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRuns.map((run) => (
                      <tr key={run._id} className="border-b last:border-0">
                        <td className="py-2 pr-4">
                          <Link
                            href={`/agents/${run.agentId}`}
                            className="hover:underline truncate block max-w-[180px]"
                          >
                            {agentMap.get(String(run.agentId)) ??
                              String(run.agentId)}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1.5">
                            <RunStatusIcon status={run.status} />
                            <Badge
                              variant={
                                run.status === "completed"
                                  ? "secondary"
                                  : run.status === "failed"
                                    ? "destructive"
                                    : "outline"
                              }
                              className="text-[10px] capitalize"
                            >
                              {run.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {run.trigger === "schedule" ? (
                              <Clock size={12} />
                            ) : (
                              <Zap size={12} />
                            )}
                            {run.trigger}
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground font-mono">
                          {formatDuration(run.startedAt, run.completedAt)}
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted-foreground font-mono">
                          {run.toolUseCount ?? 0}
                        </td>
                        <td className="py-2 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {timeAgo(run.startedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
