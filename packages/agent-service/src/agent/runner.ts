import { Agent } from "@mariozechner/pi-agent-core";
import { getModel } from "@mariozechner/pi-ai";
import { getAgent, createRun, updateRun, addRunMessage, updateAgentLastRun } from "../convex/client.js";
import { buildSystemPrompt } from "./prompt.js";
import { getAllTools, getToolMetadata } from "../tools/index.js";
import { toAgentTools } from "../tools/bridge.js";
import { uploadJson, isR2Enabled } from "../storage/r2.js";

export async function runAgent(agentId: string, trigger: "manual" | "schedule") {
  let runId: string | undefined;

  try {
    // Fetch agent config from Convex
    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    // Create a run record
    runId = await createRun({
      agentId,
      trigger,
      status: "running",
      startedAt: Date.now(),
    });

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
    const systemPrompt = buildSystemPrompt(agent.name, agent.prompt ?? "", agent.guardrails, toolMeta);

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    const model = getModel("anthropic", "claude-sonnet-4-20250514");

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

    let messageCount = 0;
    let toolUseCount = 0;

    // Subscribe to events for logging & Convex persistence
    piAgent.subscribe((event) => {
      switch (event.type) {
        case "message_end": {
          messageCount++;
          const msg = event.message;
          if ("role" in msg && (msg.role === "user" || msg.role === "assistant")) {
            addRunMessage({
              runId: runId!,
              role: msg.role,
              content: JSON.stringify("content" in msg ? msg.content : msg),
              timestamp: Date.now(),
            }).catch(console.error);
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
    await piAgent.prompt(`Execute your task. Trigger: ${trigger}`);
    await piAgent.waitForIdle();

    // Update run as completed
    await updateRun(runId!, {
      status: "completed",
      completedAt: Date.now(),
      messageCount,
      toolUseCount,
    });

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
