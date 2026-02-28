import CronExpressionParser from "cron-parser";
import { listActiveAgents, type AgentDoc } from "./convex/client.js";
import { runAgent } from "./agent/runner.js";

const runningAgents = new Set<string>();

function isDue(agent: AgentDoc): boolean {
  const now = Date.now();

  // Check cron schedule first (takes priority)
  if (agent.cron) {
    try {
      const interval = CronExpressionParser.parse(agent.cron);
      const prev = interval.prev().getTime();
      const lastRun = agent.lastRunAt ?? 0;
      // Due if the most recent cron tick is after our last run
      return prev > lastRun;
    } catch {
      // Invalid cron expression — skip
      return false;
    }
  }

  // Check hours-based interval
  if (agent.hours && agent.hours > 0) {
    const intervalMs = agent.hours * 60 * 60 * 1000;
    const lastRun = agent.lastRunAt ?? 0;
    return now - lastRun >= intervalMs;
  }

  return false;
}

async function tick() {
  try {
    const agents = await listActiveAgents();
    for (const agent of agents) {
      const agentId = agent._id;

      // Skip agents without a schedule
      if (!agent.hours && !agent.cron) continue;

      // Skip already-running agents
      if (runningAgents.has(agentId)) continue;

      if (isDue(agent)) {
        console.log(`[scheduler] Agent "${agent.name}" (${agentId}) is due — triggering heartbeat run`);
        runningAgents.add(agentId);
        runAgent(agentId, "schedule")
          .catch((err) => {
            console.error(`[scheduler] Run failed for agent ${agentId}:`, err);
          })
          .finally(() => {
            runningAgents.delete(agentId);
          });
      }
    }
  } catch (err) {
    console.error("[scheduler] Tick error:", err);
  }
}

export function startScheduler() {
  console.log("[scheduler] Starting scheduler (60s interval, 5s initial delay)");
  setTimeout(() => {
    tick(); // Run immediately after delay
    setInterval(tick, 60_000);
  }, 5_000);
}
