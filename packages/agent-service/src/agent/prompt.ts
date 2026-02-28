import type { ToolMetadata } from "../tools/types.js";

export const DEFAULT_HEARTBEAT_PROMPT = `Perform your routine heartbeat check.

## Checklist
1. Check for new leads, emails, or messages that need attention
2. Review any pending or in-progress work items
3. Look for time-sensitive tasks or deadlines
4. Process any queued outreach or follow-ups

## Rules
- If nothing needs attention → HEARTBEAT_OK with a one-line status
- If you find items requiring action → process them, report HEARTBEAT_ALERT with summary
- Be efficient — skip checks that don't apply to your configured tools
- Prioritize urgent items over routine tasks`;

export function buildSystemPrompt(
  name: string,
  prompt: string,
  guardrails?: string,
  tools?: ToolMetadata[]
): string {
  let systemPrompt = `You are "${name}", an autonomous GTM (Go-To-Market) research agent.

Your task is described below. Execute it thoroughly and report your findings.

## Your Task
${prompt}`;

  if (guardrails) {
    systemPrompt += `

## Guardrails
${guardrails}`;
  }

  if (tools && tools.length > 0) {
    systemPrompt += `

## Tools Available
Use the tools provided to gather real data. Do not claim you cannot use tools — call them directly.`;
    for (const tool of tools) {
      systemPrompt += `\n- **${tool.name}**: ${tool.description}`;
    }
  }

  systemPrompt += `

## Guidelines
- Be thorough but concise in your research
- Use tools to gather real data — don't fabricate information
- Summarize your findings clearly at the end
- If you encounter errors, note them and continue with what you can find`;

  return systemPrompt;
}
