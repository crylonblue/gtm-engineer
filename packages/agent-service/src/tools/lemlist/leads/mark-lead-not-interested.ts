import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  leadIdOrEmail: z
    .string()
    .describe("Lead ID (e.g. lea_7kMNQwplxvvD2hf5z) or email address"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.post(
    `/leads/not-interested/${encodeURIComponent(params.leadIdOrEmail)}`
  );
  return { success: true, data };
}

export const markLeadNotInterestedTool: ToolDefinition<Params> = {
  name: "lemlist_mark_lead_not_interested",
  description:
    "Mark a lead as not interested across all Lemlist campaigns. Accepts a lead ID or email address.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
