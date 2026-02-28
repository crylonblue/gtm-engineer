import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject, HubSpotCreateBody } from "../types.js";

// HubSpot association type IDs for notes
const NOTE_TO_CONTACT = 202;
const NOTE_TO_COMPANY = 190;
const NOTE_TO_DEAL = 214;

const parameters = z.object({
  body: z.string().describe("Note body text (HTML supported)"),
  timestamp: z
    .string()
    .optional()
    .describe("Note timestamp (ISO 8601). Defaults to now."),
  associatedContactIds: z
    .array(z.string())
    .optional()
    .describe("Contact IDs to associate with this note"),
  associatedCompanyIds: z
    .array(z.string())
    .optional()
    .describe("Company IDs to associate with this note"),
  associatedDealIds: z
    .array(z.string())
    .optional()
    .describe("Deal IDs to associate with this note"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();

  const properties: Record<string, string> = {
    hs_note_body: params.body,
    hs_timestamp: params.timestamp || new Date().toISOString(),
  };

  const requestBody: HubSpotCreateBody = { properties };

  const associations: HubSpotCreateBody["associations"] = [];
  if (params.associatedContactIds) {
    for (const id of params.associatedContactIds) {
      associations.push({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: NOTE_TO_CONTACT }],
      });
    }
  }
  if (params.associatedCompanyIds) {
    for (const id of params.associatedCompanyIds) {
      associations.push({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: NOTE_TO_COMPANY }],
      });
    }
  }
  if (params.associatedDealIds) {
    for (const id of params.associatedDealIds) {
      associations.push({
        to: { id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: NOTE_TO_DEAL }],
      });
    }
  }
  if (associations.length > 0) requestBody.associations = associations;

  const data = await client.post<HubSpotObject>(
    "/crm/v3/objects/notes",
    requestBody
  );
  return { success: true, data };
}

export const createNoteTool: ToolDefinition<Params> = {
  name: "hubspot_create_note",
  description:
    "Create a note in HubSpot, optionally associated with contacts, companies, and/or deals.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
