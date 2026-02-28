import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoBulkEnrichPersonResponse } from "../types.js";

const recordSchema = z.object({
  identifier: z.string().describe("Unique identifier to correlate with response"),
  firstName: z.string().optional().describe("Person's first name"),
  lastName: z.string().optional().describe("Person's last name"),
  fullName: z.string().optional().describe("Person's full name"),
  linkedinUrl: z.string().optional().describe("LinkedIn profile URL"),
  email: z.string().optional().describe("Email address"),
  companyName: z.string().optional().describe("Company name"),
  companyWebsite: z.string().optional().describe("Company website domain"),
  companyLinkedinUrl: z.string().optional().describe("Company LinkedIn URL"),
  personId: z.string().optional().describe("Person ID from a previous Prospeo search"),
});

const parameters = z.object({
  records: z.array(recordSchema).max(50).describe("Up to 50 person records to enrich"),
  onlyVerifiedEmail: z.boolean().optional().default(false).describe("Only return results with a verified email"),
  enrichMobile: z.boolean().optional().describe("Enrich mobile phone numbers (10 credits each instead of 1)"),
  onlyVerifiedMobile: z.boolean().optional().default(false).describe("Only return results with a verified mobile"),
});

type Params = z.infer<typeof parameters>;

function mapRecord(r: z.infer<typeof recordSchema>): Record<string, string> {
  const d: Record<string, string> = { identifier: r.identifier };
  if (r.firstName) d.first_name = r.firstName;
  if (r.lastName) d.last_name = r.lastName;
  if (r.fullName) d.full_name = r.fullName;
  if (r.linkedinUrl) d.linkedin_url = r.linkedinUrl;
  if (r.email) d.email = r.email;
  if (r.companyName) d.company_name = r.companyName;
  if (r.companyWebsite) d.company_website = r.companyWebsite;
  if (r.companyLinkedinUrl) d.company_linkedin_url = r.companyLinkedinUrl;
  if (r.personId) d.person_id = r.personId;
  return d;
}

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const body: Record<string, unknown> = {
    data: params.records.map(mapRecord),
  };
  if (params.onlyVerifiedEmail) body.only_verified_email = true;
  if (params.enrichMobile) body.enrich_mobile = true;
  if (params.onlyVerifiedMobile) body.only_verified_mobile = true;

  const result = await client.post<ProspeoBulkEnrichPersonResponse>(
    "/bulk-enrich-person",
    body
  );
  return { success: !result.error, data: result };
}

export const bulkEnrichPersonTool: ToolDefinition<Params> = {
  name: "prospeo_bulk_enrich_person",
  description:
    "Enrich up to 50 people at once with verified email, phone, and company data. Each record needs an identifier and at least one valid matching combination.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
