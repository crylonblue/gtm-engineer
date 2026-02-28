import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Unique campaign identifier to start or resume"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.post(
    `/campaigns/${encodeURIComponent(params.campaignId)}/start`
  );
  return { success: true, data };
}

export const startCampaignTool: ToolDefinition<Params> = {
  name: "lemlist_start_campaign",
  description:
    "Start or resume a paused Lemlist campaign.",
  provider: "lemlist",
  category: "campaigns",
  parameters,
  execute,
};
