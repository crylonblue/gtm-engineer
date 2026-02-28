import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Campaign ID the lead belongs to"),
  leadId: z.string().describe("Unique lead identifier (e.g. lea_7kMNQwplxvvD2hf5z)"),
  firstName: z.string().optional().describe("Updated first name"),
  lastName: z.string().optional().describe("Updated last name"),
  companyName: z.string().optional().describe("Updated company name"),
  jobTitle: z.string().optional().describe("Updated job title"),
  preferredContactMethod: z
    .enum(["email", "linkedIn"])
    .optional()
    .describe("Preferred contact method"),
  contactOwner: z
    .string()
    .optional()
    .describe("Contact owner (user ID or user login email)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const { campaignId, leadId, ...body } = params;
  const client = getLemlistClient();
  const data = await client.patch(
    `/campaigns/${encodeURIComponent(campaignId)}/leads/${encodeURIComponent(leadId)}`,
    body
  );
  return { success: true, data };
}

export const updateLeadTool: ToolDefinition<Params> = {
  name: "lemlist_update_lead",
  description:
    "Update an existing lead's information in a specific Lemlist campaign.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
