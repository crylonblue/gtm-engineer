import { Hono } from "hono";
import { cors } from "hono/cors";
import { stream as honoStream } from "hono/streaming";
import { serve } from "@hono/node-server";
import { getModel } from "@mariozechner/pi-ai";
import type { UserMessage, AssistantMessage as PiAssistantMessage } from "@mariozechner/pi-ai";
import { Agent } from "@mariozechner/pi-agent-core";
import { runAgent } from "./agent/runner.js";
import { listObjects } from "./storage/r2.js";
import { getToolMetadata, getAllTools } from "./tools/index.js";
import { toAgentTools } from "./tools/bridge.js";
import { getAgent } from "./convex/client.js";
import { buildSystemPrompt } from "./agent/prompt.js";

const app = new Hono();

app.use("/*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

app.post("/api/run", async (c) => {
  const body = await c.req.json<{ agentId: string; trigger?: "manual" | "schedule" }>();
  const { agentId, trigger = "manual" } = body;

  if (!agentId) {
    return c.json({ error: "agentId is required" }, 400);
  }

  // Fire and forget — don't block the response
  runAgent(agentId, trigger).catch((err) => {
    console.error(`Agent run failed for ${agentId}:`, err);
  });

  return c.json({ status: "started", agentId, trigger });
});

app.get("/api/runs/:runId/artifacts", async (c) => {
  const runId = c.req.param("runId");
  try {
    const keys = await listObjects(`runs/${runId}/`);
    return c.json({ runId, artifacts: keys });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

// Return registered tool names and descriptions
app.get("/api/tools", (c) => {
  const tools = getToolMetadata();
  return c.json(tools);
});

// Streaming chat with agent tools — uses pi-agent-core Agent for full tool loop
app.post("/api/stream", async (c) => {
  const body = await c.req.json<{
    model?: string;
    max_tokens?: number;
    stream?: boolean;
    agentId?: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  }>();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return c.json({ error: "ANTHROPIC_API_KEY not set" }, 500);
  }

  if (!body.messages.length) {
    return c.json({ error: "messages array is empty" }, 400);
  }

  const modelId = body.model || "claude-sonnet-4-20250514";
  const model = getModel("anthropic", modelId as Parameters<typeof getModel>[1]);

  // Build conversation history (all messages except the last user message)
  const lastMsg = body.messages[body.messages.length - 1];
  const history = body.messages.slice(0, -1);

  const historyMessages = history.map((m) => {
    if (m.role === "assistant") {
      return {
        role: "assistant" as const,
        content: [{ type: "text" as const, text: m.content }],
        api: "anthropic-messages" as const,
        provider: "anthropic",
        model: modelId,
        usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
        stopReason: "stop" as const,
        timestamp: Date.now(),
      } satisfies PiAssistantMessage;
    }
    return {
      role: "user" as const,
      content: m.content,
      timestamp: Date.now(),
    } satisfies UserMessage;
  });

  // Load agent config and tools if agentId is provided
  let systemPrompt = "You are a helpful assistant.";
  let agentTools: ReturnType<typeof toAgentTools> = [];

  if (body.agentId) {
    try {
      const agentDoc = await getAgent(body.agentId);
      console.log(`[stream] agentId=${body.agentId} found=${!!agentDoc}`);
      if (agentDoc) {
        const agentToolNames = agentDoc.tools ?? [];
        console.log(`[stream] agent="${agentDoc.name}" configuredTools=[${agentToolNames.join(", ")}]`);

        const allTools = getAllTools();
        console.log(`[stream] registry has ${allTools.length} tools`);
        const filterNames = agentToolNames.length > 0 ? agentToolNames : undefined;
        agentTools = toAgentTools(allTools, filterNames);

        // Fall back to all tools if configured names don't match any registered tools
        if (filterNames && agentTools.length === 0) {
          const registeredNames = new Set(allTools.map(t => t.name));
          const missing = agentToolNames.filter(n => !registeredNames.has(n));
          console.warn(`[stream] WARNING: agent has ${agentToolNames.length} configured tool(s) but none matched the registry. Unrecognized names: [${missing.join(", ")}]. Falling back to ALL tools.`);
          agentTools = toAgentTools(allTools);
        }

        console.log(`[stream] passing ${agentTools.length} tools to Agent: [${agentTools.map(t => t.name).join(", ")}]`);

        // Build system prompt with the resolved tool list
        const resolvedToolNames = agentTools.map(t => t.name);
        const toolMeta = getToolMetadata(resolvedToolNames);
        systemPrompt = buildSystemPrompt(
          agentDoc.name,
          agentDoc.prompt ?? "",
          agentDoc.guardrails,
          toolMeta
        );
      }
    } catch (err) {
      console.error("[stream] Failed to load agent config:", err);
    }
  } else {
    // No agent specified — enable all tools by default
    const allTools = getAllTools();
    agentTools = toAgentTools(allTools);
    console.log(`[stream] No agentId provided, using all ${agentTools.length} tools`);
  }

  // Create pi-agent-core Agent with tools
  const piAgent = new Agent({
    initialState: {
      systemPrompt,
      model,
      thinkingLevel: "off",
      tools: agentTools,
    },
    getApiKey: async () => apiKey,
    maxRetryDelayMs: 120_000,
  });

  // Set conversation history
  if (historyMessages.length > 0) {
    piAgent.replaceMessages(historyMessages);
  }

  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  return honoStream(c, async (stream) => {
    try {
      // Subscribe to agent events and forward text deltas + structured tool events
      piAgent.subscribe((event) => {
        if (event.type === "message_update") {
          const ae = event.assistantMessageEvent;
          if (ae.type === "text_delta") {
            const payload = JSON.stringify({
              type: "content_block_delta",
              delta: { type: "text_delta", text: ae.delta },
            });
            stream.write(`data: ${payload}\n\n`);
          }
        } else if (event.type === "tool_execution_start") {
          const ev = event as Record<string, unknown>;
          const args = ev.args ?? ev.input ?? {};
          const payload = JSON.stringify({
            type: "tool_call_start",
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            args: typeof args === "string" ? args : JSON.stringify(args),
          });
          stream.write(`data: ${payload}\n\n`);
        } else if (event.type === "tool_execution_end") {
          const ev = event as Record<string, unknown>;
          const result = ev.result;
          const payload = JSON.stringify({
            type: "tool_call_end",
            toolCallId: event.toolCallId,
            toolName: event.toolName,
            result: typeof result === "string" ? result : JSON.stringify(result ?? {}),
            isError: event.isError,
          });
          stream.write(`data: ${payload}\n\n`);
        }
      });

      // Run the agent with the user's message
      await piAgent.prompt(lastMsg.content);
      await piAgent.waitForIdle();

      await stream.write("data: [DONE]\n\n");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("Stream error:", errMsg);
      const payload = JSON.stringify({
        type: "error",
        error: { message: errMsg },
      });
      await stream.write(`data: ${payload}\n\n`);
      await stream.write("data: [DONE]\n\n");
    }
  });
});

const port = parseInt(process.env.PORT || "3001", 10);
const hostname = "0.0.0.0";
console.log(`Starting agent service on ${hostname}:${port}`);
serve({ fetch: app.fetch, port, hostname });
