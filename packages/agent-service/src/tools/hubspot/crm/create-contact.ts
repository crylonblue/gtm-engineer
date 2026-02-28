import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getHubSpotClient } from "../client.js";
import type { HubSpotObject } from "../types.js";

const parameters = z.object({
  email: z.string().describe("Contact email address (required)"),
  firstname: z.string().optional().describe("First name"),
  lastname: z.string().optional().describe("Last name"),
  phone: z.string().optional().describe("Phone number"),
  company: z.string().optional().describe("Company name"),
  jobtitle: z.string().optional().describe("Job title"),
  lifecyclestage: z.string().optional().describe("Lifecycle stage (e.g. lead, subscriber, opportunity, customer)"),
  additionalProperties: z
    .record(z.string(), z.string())
    .optional()
    .describe("Additional HubSpot contact properties as key-value pairs"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getHubSpotClient();
  const properties: Record<string, string> = { ...params.additionalProperties };

  properties.email = params.email;
  if (params.firstname) properties.firstname = params.firstname;
  if (params.lastname) properties.lastname = params.lastname;
  if (params.phone) properties.phone = params.phone;
  if (params.company) properties.company = params.company;
  if (params.jobtitle) properties.jobtitle = params.jobtitle;
  if (params.lifecyclestage) properties.lifecyclestage = params.lifecyclestage;

  const data = await client.post<HubSpotObject>(
    "/crm/v3/objects/contacts",
    { properties }
  );
  return { success: true, data };
}

export const createContactTool: ToolDefinition<Params> = {
  name: "hubspot_create_contact",
  description:
    "Create a new HubSpot contact. Email is required. Supports standard and custom properties.",
  provider: "hubspot",
  category: "crm",
  parameters,
  execute,
};
