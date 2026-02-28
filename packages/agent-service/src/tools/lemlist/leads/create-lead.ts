import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Campaign ID to add the lead to"),
  email: z.string().email().describe("Email address of the lead"),
  firstName: z.string().optional().describe("First name of the lead"),
  lastName: z.string().optional().describe("Last name of the lead"),
  companyName: z.string().optional().describe("Company name"),
  jobTitle: z.string().optional().describe("Job title"),
  linkedinUrl: z.string().optional().describe("LinkedIn profile URL"),
  phone: z.string().optional().describe("Phone number"),
  companyDomain: z.string().optional().describe("Company domain"),
  icebreaker: z.string().optional().describe("Personalized icebreaker message"),
  deduplicate: z
    .boolean()
    .optional()
    .describe("Skip if email exists in other campaigns (default false)"),
  findEmail: z
    .boolean()
    .optional()
    .describe("Find verified email (default false)"),
  verifyEmail: z
    .boolean()
    .optional()
    .describe("Verify existing email via debounce (default false)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const { campaignId, deduplicate, findEmail, verifyEmail, ...body } = params;
  const client = getLemlistClient();

  // Build URL with query params
  const queryParts: string[] = [];
  if (deduplicate !== undefined) queryParts.push(`deduplicate=${deduplicate}`);
  if (findEmail !== undefined) queryParts.push(`findEmail=${findEmail}`);
  if (verifyEmail !== undefined) queryParts.push(`verifyEmail=${verifyEmail}`);
  const qs = queryParts.length ? `?${queryParts.join("&")}` : "";

  const data = await client.post(
    `/campaigns/${encodeURIComponent(campaignId)}/leads/${qs}`,
    body
  );
  return { success: true, data };
}

export const createLeadTool: ToolDefinition<Params> = {
  name: "lemlist_create_lead",
  description:
    "Create a new lead and add it to a specific Lemlist campaign. Supports deduplication and automatic email enrichment.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
