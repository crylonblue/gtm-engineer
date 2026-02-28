import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  companyId: z.string().describe("HubSpot company ID"),
  properties: z
    .array(z.string())
    .default(["name", "domain", "industry", "city", "state", "country", "numberofemployees", "annualrevenue"])
    .describe("Company properties to return"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const qs = new URLSearchParams();
  for (const p of params.properties) qs.append("properties", p);

  const data = await client.get<HubSpotObject>(
    `/crm/v3/objects/companies/${encodeURIComponent(params.companyId)}?${qs.toString()}`
  );
  return { success: true, data };
}

export const getCompanyTool: ToolDefinition<Params> = {
  name: "hubspot_get_company",
  description: "Get a single HubSpot company by ID with specified properties.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
