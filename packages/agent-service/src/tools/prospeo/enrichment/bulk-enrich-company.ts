import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoBulkEnrichCompanyResponse } from "../types.js";

const recordSchema = z.object({
  identifier: z.string().describe("Unique identifier to correlate with response"),
  companyWebsite: z.string().optional().describe("Company website domain — preferred identifier"),
  companyLinkedinUrl: z.string().optional().describe("Company LinkedIn URL"),
  companyName: z.string().optional().describe("Company name (not recommended as sole identifier)"),
  companyId: z.string().optional().describe("Company ID from a previous Prospeo enrichment"),
});

const parameters = z.object({
  records: z.array(recordSchema).max(50).describe("Up to 50 company records to enrich"),
});

type Params = z.infer<typeof parameters>;

function mapRecord(r: z.infer<typeof recordSchema>): Record<string, string> {
  const d: Record<string, string> = { identifier: r.identifier };
  if (r.companyWebsite) d.company_website = r.companyWebsite;
  if (r.companyLinkedinUrl) d.company_linkedin_url = r.companyLinkedinUrl;
  if (r.companyName) d.company_name = r.companyName;
  if (r.companyId) d.company_id = r.companyId;
  return d;
}

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const result = await client.post<ProspeoBulkEnrichCompanyResponse>(
    "/bulk-enrich-company",
    { data: params.records.map(mapRecord) }
  );
  return { success: !result.error, data: result };
}

export const bulkEnrichCompanyTool: ToolDefinition<Params> = {
  name: "prospeo_bulk_enrich_company",
  description:
    "Enrich up to 50 companies at once with funding, tech stack, employee data, and more. Each record needs an identifier and at least one company identifier.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
