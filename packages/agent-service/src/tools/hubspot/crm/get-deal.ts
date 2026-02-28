import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObjectWithAssociations } from "../types.js";

const parameters = z.object({
  dealId: z.string().describe("HubSpot deal ID"),
  properties: z
    .array(z.string())
    .default(["dealname", "dealstage", "pipeline", "amount", "closedate", "hubspot_owner_id"])
    .describe("Deal properties to return"),
  associations: z
    .array(z.enum(["contacts", "companies"]))
    .optional()
    .describe("Associated object types to include"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const qs = new URLSearchParams();
  for (const p of params.properties) qs.append("properties", p);
  if (params.associations) {
    for (const a of params.associations) qs.append("associations", a);
  }

  const data = await client.get<HubSpotObjectWithAssociations>(
    `/crm/v3/objects/deals/${encodeURIComponent(params.dealId)}?${qs.toString()}`
  );
  return { success: true, data };
}

export const getDealTool: ToolDefinition<Params> = {
  name: "hubspot_get_deal",
  description:
    "Get a single HubSpot deal by ID with specified properties and optional associations to contacts/companies.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
