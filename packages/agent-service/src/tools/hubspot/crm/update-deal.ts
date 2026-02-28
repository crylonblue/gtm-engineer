import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  dealId: z.string().describe("HubSpot deal ID to update"),
  properties: z.record(z.string(), z.string()).describe("Properties to update as key-value pairs"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const data = await client.patch<HubSpotObject>(
    `/crm/v3/objects/deals/${encodeURIComponent(params.dealId)}`,
    { properties: params.properties }
  );
  return { success: true, data };
}

export const updateDealTool: ToolDefinition<Params> = {
  name: "hubspot_update_deal",
  description: "Update properties on an existing HubSpot deal.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
