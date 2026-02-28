import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  companyId: z.string().describe("HubSpot company ID to update"),
  properties: z.record(z.string(), z.string()).describe("Properties to update as key-value pairs"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const data = await client.patch<HubSpotObject>(
    `/crm/v3/objects/companies/${encodeURIComponent(params.companyId)}`,
    { properties: params.properties }
  );
  return { success: true, data };
}

export const updateCompanyTool: ToolDefinition<Params> = {
  name: "hubspot_update_company",
  description: "Update properties on an existing HubSpot company.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
