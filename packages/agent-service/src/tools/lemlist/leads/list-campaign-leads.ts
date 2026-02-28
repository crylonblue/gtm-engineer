import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Unique campaign identifier"),
  state: z
    .string()
    .optional()
    .describe("Filter leads by state (e.g. scanned, contacted, interested)"),
  limit: z
    .number()
    .default(100)
    .describe("Maximum number of leads to return (max 500)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get(
    `/campaigns/${encodeURIComponent(params.campaignId)}/leads/`,
    {
      state: params.state,
      limit: params.limit,
    }
  );
  return { success: true, data };
}

export const listCampaignLeadsTool: ToolDefinition<Params> = {
  name: "lemlist_list_campaign_leads",
  description:
    "List leads from a specific Lemlist campaign, optionally filtered by state. Returns lead IDs, contact IDs, and states.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
