import { Agent } from "@mariozechner/pi-agent-core";
import type { AgentEvent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import type { UserMessage, AssistantMessage as PiAssistantMessage } from "@mariozechner/pi-ai";
import { getAgent, createRun, updateRun, updateAgentLastRun, getOrCreateConversation, getConversationMessages, addConversationMessage } from "../convex/client.js";
import { buildSystemPrompt, DEFAULT_HEARTBEAT_PROMPT } from "./prompt.js";
import { getAllTools, getToolMetadata } from "../tools/index.js";
import { toAgentTools } from "../tools/bridge.js";
import { uploadJson, isR2Enabled } from "../storage/r2.js";

export async function runAgent(agentId: string, trigger: "manual" | "schedule" | "heartbeat") {
  let runId: string | undefined;

  try {
    // Fetch agent config from Convex
    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Create a run record
    console.log(`[runner] Creating run for agent=${agentId} trigger=${trigger}`);
    runId = await createRun({
      agentId,
      trigger,
      status: "running",
      startedAt: Date.now(),
    });
    console.log(`[runner] Run created: ${runId}`);

    // Snapshot agent config to R2
    if (isR2Enabled()) {
      uploadJson(`agents/${agentId}/config.json`, agent).catch(console.error);
    }

    // Determine which tools this agent can use
    const agentToolNames = agent.tools ?? [];
    const filterNames = agentToolNames.length > 0 ? agentToolNames : undefined;

    // Convert Zod tools to pi-agent-core AgentTools
    const allTools = getAllTools();
    let agentTools = toAgentTools(allTools, filterNames);

    // Fall back to all tools if configured names don't match any registered tools
    if (filterNames && agentTools.length === 0) {
      const registeredNames = new Set(allTools.map(t => t.name));
      const missing = agentToolNames.filter(n => !registeredNames.has(n));
      console.warn(`[runner] WARNING: agent has ${agentToolNames.length} configured tool(s) but none matched the registry. Unrecognized names: [${missing.join(", ")}]. Falling back to ALL tools.`);
      agentTools = toAgentTools(allTools);
    }

    const toolMeta = getToolMetadata(agentTools.length < allTools.length ? agentToolNames : undefined);
    const useHeartbeat = trigger === "schedule" || trigger === "heartbeat";
    const taskPrompt = useHeartbeat
      ? (agent.heartbeat || DEFAULT_HEARTBEAT_PROMPT)
      : (agent.prompt ?? "");
    const systemPrompt = buildSystemPrompt(agent.name, taskPrompt, agent.guardrails, toolMeta);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const modelId = "claude-sonnet-4-20250514";
    const model = getModel("anthropic", modelId);

    // ── Load conversation history ──────────────────────────────────
    const conversationId = await getOrCreateConversation(agent._id, agent.name);
    console.log(`[runner] Using conversation ${conversationId}`);

    const existingMessages = await getConversationMessages(conversationId);
    const historyMessages = existingMessages.map((m) => {
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

    // Create pi-agent-core Agent with built-in retry & rate-limit handling
    const piAgent = new Agent({
      initialState: {
        systemPrompt,
        model,
        thinkingLevel: "off",
        tools: agentTools,
      },
      getApiKey: async () => apiKey,
      maxRetryDelayMs: 120_000, // Wait up to 2 minutes for rate limit retries
    });

    // Set conversation history so the agent has full context
    if (historyMessages.length > 0) {
      piAgent.replaceMessages(historyMessages);
      console.log(`[runner] Loaded ${historyMessages.length} history messages`);
    }

    let messageCount = 0;
    let toolUseCount = 0;

    // Subscribe to events for logging & Convex persistence
    piAgent.subscribe((event: AgentEvent) => {
      switch (event.type) {
        case "message_end": {
          messageCount++;
          const msg = event.message;
          if ("role" in msg && (msg.role === "user" || msg.role === "assistant")) {
            let content: string;
            if (msg.role === "assistant") {
              const blocks = Array.isArray(msg.content) ? msg.content : [];
              content = blocks
                .filter((b): b is { type: "text"; text: string } => "type" in b && b.type === "text")
                .map((b) => b.text)
                .join("");
            } else {
              content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
            }
            addConversationMessage(conversationId, msg.role, content).catch(console.error);
          }
          break;
        }
        case "tool_execution_start": {
          toolUseCount++;
          console.log(`  Tool: ${event.toolName} (${event.toolCallId})`);
          break;
        }
        case "tool_execution_end": {
          if (isR2Enabled()) {
            uploadJson(`runs/${runId}/tools/${toolUseCount}-${event.toolName}.json`, {
              toolCallId: event.toolCallId,
              name: event.toolName,
              result: event.result,
              isError: event.isError,
            }).catch(console.error);
          }
          break;
        }
      }
    });

    // Run the agent
    console.log(`[runner] Starting agent prompt...`);
    const kickoffMessage = useHeartbeat
      ? (agent.heartbeat || DEFAULT_HEARTBEAT_PROMPT)
      : `Execute your task. Trigger: ${trigger}`;
    await piAgent.prompt(kickoffMessage);
    await piAgent.waitForIdle();
    console.log(`[runner] Agent finished. messages=${messageCount} tools=${toolUseCount}`);

    // Update run as completed
    console.log(`[runner] Updating run ${runId} as completed...`);
    await updateRun(runId!, {
      status: "completed",
      completedAt: Date.now(),
      messageCount,
      toolUseCount,
    });

    console.log(`[runner] Updating agent lastRun...`);
    await updateAgentLastRun(agentId, Date.now(), "completed");

    // Store run artifacts to R2 (fire-and-forget)
    if (isR2Enabled()) {
      const messages = piAgent.state.messages;
      uploadJson(`runs/${runId}/messages.json`, messages).catch(console.error);
      uploadJson(`runs/${runId}/run.json`, {
        runId,
        agentId,
        trigger,
        status: "completed",
        startedAt: Date.now(),
        completedAt: Date.now(),
        messageCount,
        toolUseCount,
        agentConfig: agent,
      }).catch(console.error);
    }

    console.log(`Agent run completed: ${runId} (${messageCount} messages, ${toolUseCount} tool uses)`);
  } catch (err) {
    console.error("Agent run error:", err);
    if (runId) {
      await updateRun(runId, {
        status: "failed",
        completedAt: Date.now(),
        error: err instanceof Error ? err.message : String(err),
      }).catch(console.error);

      // Store failure to R2
      if (isR2Enabled()) {
        uploadJson(`runs/${runId}/run.json`, {
          runId,
          agentId,
          trigger,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
          completedAt: Date.now(),
        }).catch(console.error);
      }
    }
  }
}
