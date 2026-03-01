"use client";

export const dynamic = "force-dynamic";

import { use, useRef, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Search, ChevronDown, Trash2, HeartPulse } from "lucide-react";
import { RunLogs } from "@/components/runs/run-logs";
import { ChatArea } from "@/components/chat/chat-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AGENT_URL =
  process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3001";

interface ToolInfo {
  name: string;
  description: string;
  provider: string;
  category: string;
}

function useAvailableTools() {
  const [tools, setTools] = useState<ToolInfo[]>([]);

  useEffect(() => {
    fetch(`${AGENT_URL}/api/tools`)
      .then((res) => res.json())
      .then((data: ToolInfo[]) => setTools(data))
      .catch((err) => console.error("Failed to fetch tools:", err));
  }, []);

  return tools;
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const agent = useQuery(api.agents.get, { id: id as Id<"agents"> });
  const update = useMutation(api.agents.update);
  const remove = useMutation(api.agents.remove);

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [hours, setHours] = useState(2);
  const [cron, setCron] = useState("");
  const [heartbeat, setHeartbeat] = useState("");
  const [guardrails, setGuardrails] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "configure" | "runs">("chat");
  const [isRunning, setIsRunning] = useState(false);
  const [initializedAgentId, setInitializedAgentId] = useState<string | null>(null);

  // Chat: find or create a conversation for this agent
  const agentConversation = useQuery(api.conversations.getByAgent, {
    agentId: id as Id<"agents">,
  });
  const createConversation = useMutation(api.conversations.create);
  const [localConversationId, setLocalConversationId] = useState<Id<"conversations"> | null>(null);
  const conversationId = localConversationId ?? agentConversation?._id ?? null;

  if (agent && initializedAgentId === null) {
    setInitializedAgentId(agent._id);
    setName(agent.name);
    setPrompt(agent.prompt ?? "");
    setHours(agent.hours ?? 0);
    setCron(agent.cron ?? "");
    setHeartbeat((agent as Record<string, unknown>).heartbeat as string ?? "");
    setGuardrails(agent.guardrails ?? "");
    setSelectedTools(agent.tools);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const autosave = useCallback(
    (fields: Omit<Parameters<typeof update>[0], "id">) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        update({ id: id as Id<"agents">, ...fields });
      }, 500);
    },
    [id, update],
  );

  const handleDelete = async () => {
    await remove({ id: id as Id<"agents"> });
    router.push("/agents");
  };

  if (agent === undefined) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (agent === null) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Agent not found.
      </div>
    );
  }

  const schedule = hours > 0 ? `Every ${hours}h` : cron || "Not set";

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="capitalize">
          {agent.status}
        </Badge>
        <span>{schedule}</span>
        <span>
          Last run: {agent.lastRun ? new Date(agent.lastRun).toLocaleString() : "Never"}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isRunning}
            onClick={async () => {
              setIsRunning(true);
              try {
                const res = await fetch(
                  `${AGENT_URL}/api/run`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      agentId: id,
                      trigger: "heartbeat",
                    }),
                  }
                );
                if (!res.ok) console.error("Run failed:", await res.text());
              } catch (err) {
                console.error("Run failed:", err);
              } finally {
                setTimeout(() => setIsRunning(false), 3000);
              }
            }}
          >
            <HeartPulse className={`size-4 ${isRunning ? "animate-pulse" : ""}`} />
            {isRunning ? "Running..." : "Heartbeat"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-1">
        <Button
          variant={activeTab === "chat" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </Button>
        <Button
          variant={activeTab === "configure" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("configure")}
        >
          Configure
        </Button>
        <Button
          variant={activeTab === "runs" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("runs")}
        >
          Run &amp; Logs
        </Button>
      </div>

      {activeTab === "chat" && (
        <div className="h-[calc(100vh-14rem)] border rounded-none">
          <ChatArea
            conversationId={conversationId}
            agentId={id}
            onNewChat={async () => {
              const newId = await createConversation({
                title: agent.name,
                agentId: id as Id<"agents">,
              });
              setLocalConversationId(newId);
            }}
          />
        </div>
      )}

      {activeTab === "runs" && (
        <RunLogs agentId={id as Id<"agents">} />
      )}

      {activeTab === "configure" && <>
      {/* Configuration header */}
      <div className="flex items-center justify-between">
        <span className="font-bold">Configuration</span>
        <span className="text-sm text-green-600">Auto-saving</span>
      </div>

      {/* Goal */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                autosave({ name: e.target.value });
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Instruction Prompt</label>
            <Textarea
              placeholder="Define the goal and constraints for this automation."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                autosave({ prompt: e.target.value });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Every X hours</label>
            <Input
              type="number"
              value={hours}
              onChange={(e) => {
                const val = Number(e.target.value);
                setHours(val);
                autosave({ hours: val });
              }}
            />
            <p className="text-sm text-muted-foreground">
              Default simple schedule. Runs repeatedly in your selected timezone.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Advanced schedule (Cron)
            </label>
            <Input
              value={cron}
              onChange={(e) => {
                setCron(e.target.value);
                autosave({ cron: e.target.value });
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Heartbeat Prompt */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Heartbeat Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-sm font-medium">
            Prompt used for scheduled (heartbeat) runs
          </label>
          <Textarea
            placeholder="Custom heartbeat prompt. Leave empty to use the default checklist."
            value={heartbeat}
            rows={8}
            onChange={(e) => {
              setHeartbeat(e.target.value);
              autosave({ heartbeat: e.target.value });
            }}
          />
          <p className="text-sm text-muted-foreground">
            When this agent runs on schedule, it uses this prompt instead of the main instruction prompt. Leave blank for the default heartbeat checklist.
          </p>
        </CardContent>
      </Card>

      {/* Guardrails */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label className="text-sm font-medium">
            Non-negotiable rules (optional)
          </label>
          <Textarea
            placeholder="Example: Never DM users without keyword match. Stop after 10 failed actions. Do not comment on political content."
            value={guardrails}
            onChange={(e) => {
              setGuardrails(e.target.value);
              autosave({ guardrails: e.target.value });
            }}
          />
          <p className="text-sm text-muted-foreground">
            These rules are prepended to each task and treated as hard
            constraints.
          </p>
        </CardContent>
      </Card>

      {/* Tool Access */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Tool Access</CardTitle>
        </CardHeader>
        <CardContent>
          <ToolDropdown
            selectedTools={selectedTools}
            setSelectedTools={(tools) => {
              setSelectedTools(tools);
              update({ id: id as Id<"agents">, tools });
            }}
          />
        </CardContent>
      </Card>
      </>}
    </div>
  );
}

function ToolDropdown({
  selectedTools,
  setSelectedTools,
}: {
  selectedTools: string[];
  setSelectedTools: (tools: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const availableTools = useAvailableTools();
  const toolNames = availableTools.map((t) => t.name);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = availableTools.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  const allSelected = toolNames.length > 0 && toolNames.every((t) =>
    selectedTools.includes(t)
  );

  function toggleTool(tool: string) {
    const next = selectedTools.includes(tool)
      ? selectedTools.filter((t) => t !== tool)
      : [...selectedTools, tool];
    setSelectedTools(next);
  }

  function toggleAll() {
    setSelectedTools(allSelected ? [] : [...toolNames]);
  }

  const label = allSelected
    ? "All tools"
    : selectedTools.length === 0
      ? "Select tools..."
      : `${selectedTools.length} tool${selectedTools.length !== 1 ? "s" : ""} selected`;

  return (
    <div className="space-y-1" ref={ref}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="border-input dark:bg-input/30 flex h-9 w-full items-center justify-between rounded-none border bg-transparent px-3 py-2 text-sm shadow-xs"
        >
          <span
            className={
              selectedTools.length === 0 ? "text-muted-foreground" : ""
            }
          >
            {label}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {open && (
          <div className="border-input absolute z-50 mt-1 w-full rounded-none border bg-popover shadow-md">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter tools..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filter === "" && toolNames.length > 0 && (
                <label className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-accent/50">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4"
                  />
                  <span className="font-medium">All tools</span>
                </label>
              )}
              {filtered.map((tool) => (
                <label
                  key={tool.name}
                  className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-accent/50"
                  title={tool.description}
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.name)}
                    onChange={() => toggleTool(tool.name)}
                    className="size-4"
                  />
                  <span>{tool.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{tool.provider}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {allSelected
          ? "All tools enabled."
          : `${selectedTools.length} tool${selectedTools.length !== 1 ? "s" : ""} selected.`}
      </p>
    </div>
  );
}
