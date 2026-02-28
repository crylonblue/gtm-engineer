import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Unique campaign identifier"),
  startDate: z
    .string()
    .describe("Start date in ISO 8601 format (e.g. 2024-01-07T22:00:00.000Z)"),
  endDate: z
    .string()
    .describe("End date in ISO 8601 format (e.g. 2025-07-10T21:59:59.999Z)"),
  channels: z
    .array(z.enum(["email", "linkedin", "others"]))
    .optional()
    .describe("Filter stats by channel types"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get(
    `/v2/campaigns/${encodeURIComponent(params.campaignId)}/stats`,
    {
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.channels ? { channels: JSON.stringify(params.channels) } : {}),
    }
  );
  return { success: true, data };
}

export const getCampaignStatsTool: ToolDefinition<Params> = {
  name: "lemlist_get_campaign_stats",
  description:
    "Get performance statistics for a Lemlist campaign including leads reached, opened, replied, clicked, and per-step breakdowns.",
  provider: "lemlist",
  category: "campaigns",
  parameters,
  execute,
};
