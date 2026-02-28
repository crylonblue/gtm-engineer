import type { ToolMetadata } from "../tools/types.js";

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
