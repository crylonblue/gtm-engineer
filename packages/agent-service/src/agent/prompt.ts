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

/** Group tools by provider, then by category within each provider. */
function groupTools(tools: ToolMetadata[]): Map<string, Map<string, ToolMetadata[]>> {
  const grouped = new Map<string, Map<string, ToolMetadata[]>>();
  for (const tool of tools) {
    if (!grouped.has(tool.provider)) {
      grouped.set(tool.provider, new Map());
    }
    const providerMap = grouped.get(tool.provider)!;
    if (!providerMap.has(tool.category)) {
      providerMap.set(tool.category, []);
    }
    providerMap.get(tool.category)!.push(tool);
  }
  return grouped;
}

/** Build a summary line for a provider/category group so the agent understands what it's for. */
function describeGroup(provider: string, category: string, tools: ToolMetadata[]): string {
  const names = tools.map((t) => `\`${t.name}\``).join(", ");
  return `Use ${names} for ${category}-related operations via ${provider}.`;
}

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
    const grouped = groupTools(tools);

    systemPrompt += `

## Tools Available

You have ${tools.length} tools organized by provider and category. Always call tools directly — never claim you cannot use them.

### How to pick the right tool
- Look at the **provider** to know which service a tool talks to.
- Look at the **category** to know what kind of operation it performs.
- Read each tool's description to understand its exact purpose and required parameters.
- When multiple tools seem relevant, prefer the most specific one (e.g. a dedicated search tool over a general fetch).
- If a tool errors, read the error carefully, adjust parameters, and retry once before moving on.`;

    for (const [provider, categories] of grouped) {
      systemPrompt += `\n\n### ${provider}`;
      for (const [category, categoryTools] of categories) {
        systemPrompt += `\n\n**${category}** — ${describeGroup(provider, category, categoryTools)}`;
        for (const tool of categoryTools) {
          systemPrompt += `\n- \`${tool.name}\` (${tool.provider}/${tool.category}): ${tool.description}`;
        }
      }
    }
  }

  systemPrompt += `

## Guidelines
- Be thorough but concise in your research
- Use tools to gather real data — don't fabricate information
- When a tool errors, read the error message carefully. Adjust your parameters and retry once before moving on.
- If you encounter persistent errors, note them and continue with what you can find

### Tool Selection Rules
- **For anything LinkedIn-related** (searching people, companies, profiles, messaging, posts, invitations), **always use the \`unipile_linkedin_*\` tools**. Never use \`web_fetch\` or \`web_search\` to look up LinkedIn profiles or perform LinkedIn searches.
- Only use \`web_search\` or \`web_fetch\` for non-LinkedIn research (e.g. company websites, news articles, general web information).
- When searching LinkedIn by keyword, use \`unipile_linkedin_search_people\` or \`unipile_linkedin_search_companies\` with the \`keywords\` parameter.
- To look up filter IDs (locations, industries, skills) for LinkedIn searches, use \`unipile_linkedin_get_search_parameters\` first.

### Output
- After completing all tool calls, **always provide a clear summary** of what was done`;

  return systemPrompt;
}
