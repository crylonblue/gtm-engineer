import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  contactId: z.string().describe("HubSpot contact ID"),
  properties: z
    .array(z.string())
    .default(["email", "firstname", "lastname", "company", "jobtitle", "phone", "lifecyclestage"])
    .describe("Contact properties to return"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const qs = new URLSearchParams();
  for (const p of params.properties) qs.append("properties", p);

  const data = await client.get<HubSpotObject>(
    `/crm/v3/objects/contacts/${encodeURIComponent(params.contactId)}?${qs.toString()}`
  );
  return { success: true, data };
}

export const getContactTool: ToolDefinition<Params> = {
  name: "hubspot_get_contact",
  description: "Get a single HubSpot contact by ID with specified properties.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
