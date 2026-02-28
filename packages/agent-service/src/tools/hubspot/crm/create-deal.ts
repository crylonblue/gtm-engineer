import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject, HubSpotCreateBody } from "../types.js";

// HubSpot association type IDs
const DEAL_TO_CONTACT = 3;
const DEAL_TO_COMPANY = 341;

const parameters = z.object({
  dealname: z.string().describe("Deal name (required)"),
  dealstage: z.string().describe("Deal stage ID (required)"),
  pipeline: z.string().optional().describe("Pipeline ID (defaults to the default pipeline)"),
  amount: z.string().optional().describe("Deal amount"),
  closedate: z.string().optional().describe("Expected close date (ISO 8601)"),
  associatedContactIds: z
    .array(z.string())
    .optional()
    .describe("Contact IDs to associate with this deal"),
  associatedCompanyIds: z
    .array(z.string())
    .optional()
    .describe("Company IDs to associate with this deal"),
  additionalProperties: z
    .record(z.string(), z.string())
    .optional()
    .describe("Additional HubSpot deal properties as key-value pairs"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const properties: Record<string, string> = { ...params.additionalProperties };

  properties.dealname = params.dealname;
  properties.dealstage = params.dealstage;
  if (params.pipeline) properties.pipeline = params.pipeline;
  if (params.amount) properties.amount = params.amount;
  if (params.closedate) properties.closedate = params.closedate;

  const body: HubSpotCreateBody = { properties };

  const associations: HubSpotCreateBody["associations"] = [];
  if (params.associatedContactIds) {
    for (const id of params.associatedContactIds) {
      associations.push({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: DEAL_TO_CONTACT }],
      });
    }
  }
  if (params.associatedCompanyIds) {
    for (const id of params.associatedCompanyIds) {
      associations.push({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: DEAL_TO_COMPANY }],
      });
    }
  }
  if (associations.length > 0) body.associations = associations;

  const data = await client.post<HubSpotObject>(
    "/crm/v3/objects/deals",
    body
  );
  return { success: true, data };
}

export const createDealTool: ToolDefinition<Params> = {
  name: "hubspot_create_deal",
  description:
    "Create a new HubSpot deal with optional associations to contacts and companies. Deal name and stage are required.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
