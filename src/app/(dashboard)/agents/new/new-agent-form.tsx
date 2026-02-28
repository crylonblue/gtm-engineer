"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Search, ChevronDown } from "lucide-react";
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

// TODO: replace with dynamically fetched endpoints
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

export function NewAgentForm() {
  const router = useRouter();
  const create = useMutation(api.agents.create);
  const update = useMutation(api.agents.update);

  const [agentId, setAgentId] = useState<Id<"agents"> | null>(null);
  const [name, setName] = useState("Untitled automation");
  const [prompt, setPrompt] = useState("");
  const [hours, setHours] = useState(2);
  const [cron, setCron] = useState("");
  const [guardrails, setGuardrails] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([
    ...AVAILABLE_TOOLS,
  ]);

  const createdRef = useRef(false);

  // Create agent in Convex on mount
  useEffect(() => {
    if (createdRef.current) return;
    createdRef.current = true;
    create({
      name: "Untitled automation",
      status: "paused",
      hours: 2,
      tools: [...AVAILABLE_TOOLS],
    }).then((id) => {
      setAgentId(id);
      router.replace(`/agents/${id}`);
    });
  }, [create, router]);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const autosave = useCallback(
    (fields: Omit<Parameters<typeof update>[0], "id">) => {
      if (!agentId) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        update({ id: agentId, ...fields });
      }, 500);
    },
    [agentId, update],
  );

  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      Creating agent...
    </div>
  );
}
