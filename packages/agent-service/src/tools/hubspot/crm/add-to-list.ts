import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";

const parameters = z.object({
  listId: z.string().describe("HubSpot list ID (ILS list ID)"),
  contactIds: z.array(z.string()).describe("Array of contact IDs to add to the list"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  // HubSpot expects a bare JSON array of string record IDs
  const data = await client.put(
    `/crm/v3/lists/${encodeURIComponent(params.listId)}/memberships/add`,
    params.contactIds
  );
  return { success: true, data };
}

export const addToListTool: ToolDefinition<Params> = {
  name: "hubspot_add_to_list",
  description: "Add contacts to a HubSpot list by list ID and contact IDs.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
