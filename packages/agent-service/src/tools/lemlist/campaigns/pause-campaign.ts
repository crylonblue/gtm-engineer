import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Unique campaign identifier to pause"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.post(
    `/campaigns/${encodeURIComponent(params.campaignId)}/pause`
  );
  return { success: true, data };
}

export const pauseCampaignTool: ToolDefinition<Params> = {
  name: "lemlist_pause_campaign",
  description:
    "Pause a running Lemlist campaign. Scheduled leads will not be affected.",
  provider: "lemlist",
  category: "campaigns",
  parameters,
  execute,
};
