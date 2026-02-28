import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoEnrichCompanyResponse } from "../types.js";

const parameters = z.object({
  companyWebsite: z.string().optional().describe("Company website domain (e.g. intercom.com) — preferred identifier"),
  companyLinkedinUrl: z.string().optional().describe("Company LinkedIn URL — preferred identifier"),
  companyName: z.string().optional().describe("Company name (not recommended as sole identifier due to duplicates)"),
  companyId: z.string().optional().describe("Company ID from a previous Prospeo enrichment"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const data: Record<string, string> = {};
  if (params.companyWebsite) data.company_website = params.companyWebsite;
  if (params.companyLinkedinUrl) data.company_linkedin_url = params.companyLinkedinUrl;
  if (params.companyName) data.company_name = params.companyName;
  if (params.companyId) data.company_id = params.companyId;

  const result = await client.post<ProspeoEnrichCompanyResponse>(
    "/enrich-company",
    { data }
  );
  return { success: !result.error, data: result };
}

export const enrichCompanyTool: ToolDefinition<Params> = {
  name: "prospeo_enrich_company",
  description:
    "Enrich a company with 50+ data points including funding, tech stack, employee count, and more. Provide at least one of: companyWebsite (preferred), companyLinkedinUrl, companyName, or companyId.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
