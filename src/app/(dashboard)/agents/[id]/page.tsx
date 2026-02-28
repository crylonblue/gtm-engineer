"use client";

import { use, useRef, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Search, ChevronDown, Trash2 } from "lucide-react";
import { RunLogs } from "@/components/runs/run-logs";
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

const AVAILABLE_TOOLS = [
  "createAutomation",
  "createCampaign",
  "createDraftPost",
  "createKnowledgeSource",
  "enrollLeads",
  "getCampaignMessages",
  "getCampaignStats",
  "getContentAnalytics",
];

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
  const [guardrails, setGuardrails] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"configure" | "runs">("configure");
  const initialized = useRef(false);

  useEffect(() => {
    if (agent && !initialized.current) {
      setName(agent.name);
      setPrompt(agent.prompt ?? "");
      setHours(agent.hours);
      setCron(agent.cron ?? "");
      setGuardrails(agent.guardrails ?? "");
      setSelectedTools(agent.tools);
      initialized.current = true;
    }
  }, [agent]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tab row */}
      <div className="flex items-center gap-1">
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = AVAILABLE_TOOLS.filter((t) =>
    t.toLowerCase().includes(filter.toLowerCase())
  );

  const allSelected = AVAILABLE_TOOLS.every((t) =>
    selectedTools.includes(t)
  );

  function toggleTool(tool: string) {
    const next = selectedTools.includes(tool)
      ? selectedTools.filter((t) => t !== tool)
      : [...selectedTools, tool];
    setSelectedTools(next);
  }

  function toggleAll() {
    setSelectedTools(allSelected ? [] : [...AVAILABLE_TOOLS]);
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
              {filter === "" && (
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
                  key={tool}
                  className="flex cursor-pointer items-center gap-3 px-3 py-1.5 text-sm hover:bg-accent/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool)}
                    onChange={() => toggleTool(tool)}
                    className="size-4"
                  />
                  {tool}
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
