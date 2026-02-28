import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoEnrichPersonResponse } from "../types.js";

const parameters = z.object({
  firstName: z.string().optional().describe("Person's first name"),
  lastName: z.string().optional().describe("Person's last name"),
  fullName: z.string().optional().describe("Person's full name (alternative to first+last)"),
  linkedinUrl: z.string().optional().describe("LinkedIn profile URL"),
  email: z.string().optional().describe("Email address"),
  companyName: z.string().optional().describe("Company name"),
  companyWebsite: z.string().optional().describe("Company website domain (e.g. intercom.com)"),
  companyLinkedinUrl: z.string().optional().describe("Company LinkedIn URL"),
  personId: z.string().optional().describe("Person ID from a previous Prospeo search"),
  onlyVerifiedEmail: z.boolean().optional().default(false).describe("Only return results with a verified email"),
  enrichMobile: z.boolean().optional().describe("Enrich mobile phone number (costs 10 credits instead of 1)"),
  onlyVerifiedMobile: z.boolean().optional().default(false).describe("Only return results with a verified mobile"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const data: Record<string, string> = {};
  if (params.firstName) data.first_name = params.firstName;
  if (params.lastName) data.last_name = params.lastName;
  if (params.fullName) data.full_name = params.fullName;
  if (params.linkedinUrl) data.linkedin_url = params.linkedinUrl;
  if (params.email) data.email = params.email;
  if (params.companyName) data.company_name = params.companyName;
  if (params.companyWebsite) data.company_website = params.companyWebsite;
  if (params.companyLinkedinUrl) data.company_linkedin_url = params.companyLinkedinUrl;
  if (params.personId) data.person_id = params.personId;

  const body: Record<string, unknown> = { data };
  if (params.onlyVerifiedEmail) body.only_verified_email = true;
  if (params.enrichMobile) body.enrich_mobile = true;
  if (params.onlyVerifiedMobile) body.only_verified_mobile = true;

  const result = await client.post<ProspeoEnrichPersonResponse>(
    "/enrich-person",
    body
  );
  return { success: !result.error, data: result };
}

export const enrichPersonTool: ToolDefinition<Params> = {
  name: "prospeo_enrich_person",
  description:
    "Enrich a person with verified email, phone, job history, and company data. Provide at least: (firstName+lastName+company), fullName+company, linkedinUrl, email, or personId.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
