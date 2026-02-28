import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Unique campaign identifier (e.g. cam_A1B2C3D4E5F6G7H8I9)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get(`/campaigns/${encodeURIComponent(params.campaignId)}`);
  return { success: true, data };
}

export const getCampaignTool: ToolDefinition<Params> = {
  name: "lemlist_get_campaign",
  description:
    "Get detailed information about a specific Lemlist campaign by ID, including its status, sequences, schedules, and senders.",
  provider: "lemlist",
  category: "campaigns",
  parameters,
  execute,
};
