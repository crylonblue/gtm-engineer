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
  _id: string;
  name: string;
  prompt?: string;
  role?: string;
  guardrails?: string;
  heartbeat?: string;
  tools?: string[];
  status?: string;
  hours?: number;
  cron?: string;
  lastRunAt?: number;
  [key: string]: unknown;
}

export async function getAgent(agentId: string) {
  return await getClient().query(anyApi.agents.get, { id: agentId }) as AgentDoc | null;
}

export async function createRun(args: {
  agentId: string;
  trigger: "manual" | "schedule" | "heartbeat";
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

export async function listActiveAgents(): Promise<AgentDoc[]> {
  return await getClient().query(anyApi.agents.listActive, {}) as AgentDoc[];
}

// ── Conversation helpers ────────────────────────────────────────────

export interface ConversationDoc {
  _id: string;
  title: string;
  agentId?: string;
  lastMessageAt: number;
}

export interface MessageDoc {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    args: string;
    status: "pending" | "running" | "complete" | "error";
    result?: string;
  }>;
  isStreaming?: boolean;
}

export async function getOrCreateConversation(agentId: string, agentName: string): Promise<string> {
  const existing = await getClient().query(anyApi.conversations.getByAgent, { agentId }) as ConversationDoc | null;
  if (existing) return existing._id;
  return await getClient().mutation(anyApi.conversations.create, {
    title: agentName,
    agentId,
  }) as string;
}

export async function getConversationMessages(conversationId: string): Promise<MessageDoc[]> {
  return await getClient().query(anyApi.messages.list, { conversationId }) as MessageDoc[];
}

export async function addConversationMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
): Promise<string> {
  return await getClient().mutation(anyApi.messages.save, {
    conversationId,
    role,
    content,
  }) as string;
}
