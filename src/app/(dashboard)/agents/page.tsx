"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw, Play, Pause, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3001";

export default function AgentsPage() {
  const router = useRouter();
  const agents = useQuery(api.agents.list);
  const create = useMutation(api.agents.create);
  const update = useMutation(api.agents.update);
  const remove = useMutation(api.agents.remove);
  const [runningIds, setRunningIds] = useState<Set<string>>(new Set());

  const handleCreate = async () => {
    const id = await create({
      name: "Untitled automation",
      status: "paused",
      hours: 2,
      tools: [],
    });
    router.push(`/agents/${id}`);
  };

  if (agents === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div className="border rounded-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Schedule</th>
              <th className="px-4 py-3 text-left font-medium">Last Run</th>
              <th className="px-4 py-3 text-left font-medium">Last Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent._id} className="border-b last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/agents/${agent._id}`}
                    className="hover:underline font-medium"
                  >
                    {agent.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {agent.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {(agent.hours ?? 0) > 0 ? `Every ${agent.hours}h` : agent.cron || "Not set"}
                </td>
                <td className="px-4 py-3">
                  {agent.lastRun
                    ? new Date(agent.lastRun).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-4 py-3">{agent.lastStatus ?? "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {agent.status === "paused" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          update({ id: agent._id, status: "active" })
                        }
                      >
                        <Play />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          update({ id: agent._id, status: "paused" })
                        }
                      >
                        <Pause />
                        Pause
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={runningIds.has(agent._id)}
                      onClick={async () => {
                        setRunningIds((prev) => new Set(prev).add(agent._id));
                        try {
                          const res = await fetch(
                            `${AGENT_URL}/api/run`,
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                agentId: agent._id,
                                trigger: "heartbeat",
                              }),
                            }
                          );
                          if (!res.ok) console.error("Run failed:", await res.text());
                        } catch (err) {
                          console.error("Run failed:", err);
                        } finally {
                          setTimeout(() => {
                            setRunningIds((prev) => {
                              const next = new Set(prev);
                              next.delete(agent._id);
                              return next;
                            });
                          }, 3000);
                        }
                      }}
                    >
                      <RefreshCw className={runningIds.has(agent._id) ? "animate-spin" : ""} />
                      {runningIds.has(agent._id) ? "Running..." : "Run"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove({ id: agent._id })}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No agents yet. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
