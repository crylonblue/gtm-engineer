import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotSearchResponse } from "../types.js";

const hubspotFilterSchema = z.object({
  propertyName: z.string(),
  operator: z.enum([
    "EQ", "NEQ", "LT", "LTE", "GT", "GTE",
    "CONTAINS_TOKEN", "HAS_PROPERTY", "NOT_HAS_PROPERTY",
  ]),
  value: z.string().optional(),
});

const parameters = z.object({
  query: z.string().optional().describe("Full-text search query across contacts"),
  filterGroups: z
    .array(z.object({ filters: z.array(hubspotFilterSchema) }))
    .optional()
    .describe("HubSpot filter groups (AND within group, OR across groups)"),
  properties: z
    .array(z.string())
    .default(["email", "firstname", "lastname", "company", "jobtitle", "lifecyclestage"])
    .describe("Contact properties to return"),
  limit: z.number().default(10).describe("Maximum results to return (max 100)"),
  after: z.string().optional().describe("Pagination cursor from previous response"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const body: Record<string, unknown> = {
    properties: params.properties,
    limit: params.limit,
  };
  if (params.query) body.query = params.query;
  if (params.filterGroups) body.filterGroups = params.filterGroups;
  if (params.after) body.after = params.after;

  const data = await client.post<HubSpotSearchResponse>(
    "/crm/v3/objects/contacts/search",
    body
  );
  return { success: true, data };
}

export const searchContactsTool: ToolDefinition<Params> = {
  name: "hubspot_search_contacts",
  description:
    "Search HubSpot contacts by full-text query or property filters. Returns matching contacts with specified properties.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
