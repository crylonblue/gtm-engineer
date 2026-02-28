import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  name: z.string().describe("Company name (required)"),
  domain: z.string().optional().describe("Company website domain"),
  industry: z.string().optional().describe("Industry"),
  additionalProperties: z
    .record(z.string(), z.string())
    .optional()
    .describe("Additional HubSpot company properties as key-value pairs"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const properties: Record<string, string> = { ...params.additionalProperties };

  properties.name = params.name;
  if (params.domain) properties.domain = params.domain;
  if (params.industry) properties.industry = params.industry;

  const data = await client.post<HubSpotObject>(
    "/crm/v3/objects/companies",
    { properties }
  );
  return { success: true, data };
}

export const createCompanyTool: ToolDefinition<Params> = {
  name: "hubspot_create_company",
  description:
    "Create a new HubSpot company. Name is required. Supports standard and custom properties.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
