import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

let _client: ConvexHttpClient | null = null;

function getClient(): ConvexHttpClient {
  if (!_client) {
    const url = process.env.CONVEX_URL;
    if (!url) throw new Error("CONVEX_URL environment variable is not set");
    _client = new ConvexHttpClient(url);
  }
  return _client;
}

export interface AgentDoc {
  name: string;
  prompt?: string;
  role?: string;
  guardrails?: string;
  tools?: string[];
  status?: string;
  [key: string]: unknown;
}

export async function getAgent(agentId: string) {
  return await getClient().query(anyApi.agents.get, { id: agentId }) as AgentDoc | null;
}

export async function createRun(args: {
  agentId: string;
  trigger: "manual" | "schedule";
  status: "running" | "completed" | "failed";
  startedAt: number;
}): Promise<string> {
  return await getClient().mutation(anyApi.runs.create, args) as string;
}

export async function updateRun(
  runId: string,
  args: {
    status?: "running" | "completed" | "failed";
    completedAt?: number;
    endedAt?: number;
    messageCount?: number;
    toolUseCount?: number;
    error?: string;
  }
) {
  await getClient().mutation(anyApi.runs.update, { id: runId, ...args });
}

export async function addRunMessage(args: {
  runId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}) {
  await getClient().mutation(anyApi.runMessages.create, args);
}

export async function updateAgentLastRun(agentId: string, timestamp: number, lastStatus?: string) {
  await getClient().mutation(anyApi.agents.updateLastRun, { id: agentId, lastRunAt: timestamp, lastStatus });
}
