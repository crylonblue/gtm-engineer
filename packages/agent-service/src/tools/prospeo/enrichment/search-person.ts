import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoSearchPersonResponse } from "../types.js";

const includeExcludeSchema = z.object({
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

const fundingFilterSchema = z.object({
  stage: z.array(z.string()).optional().describe("Funding stages (e.g. Series A, Series B)"),
  funding_date: z.number().optional().describe("Days since last funding event"),
  last_funding: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional().describe("Last funding amount range (e.g. 1M, 10M)"),
  total_funding: z.object({
    min: z.string().optional(),
    max: z.string().optional(),
  }).optional().describe("Total funding amount range"),
});

const parameters = z.object({
  filters: z.object({
    person_job_title: includeExcludeSchema.optional().describe("Job titles (use prospeo_search_suggestions for valid values)"),
    person_departments: includeExcludeSchema.optional().describe("Department filter"),
    person_seniority: includeExcludeSchema.optional().describe("Seniority levels (e.g. Founder/Owner, C-Level, VP, Director, Manager)"),
    person_location: includeExcludeSchema.optional().describe("Person location (use prospeo_search_suggestions for valid values)"),
    person_year_of_experience: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional().describe("Years of experience range"),
    company_industry: includeExcludeSchema.optional().describe("Industry filter"),
    company_headcount_range: includeExcludeSchema.optional().describe("Employee count range buckets"),
    company_location: includeExcludeSchema.optional().describe("Company location filter"),
    company_funding: fundingFilterSchema.optional().describe("Funding-related filters"),
    company_technology: includeExcludeSchema.optional().describe("Technology stack filter"),
    company: z.object({
      websites: z.object({ include: z.array(z.string()) }).optional().describe("Up to 500 specific domains"),
      names: z.object({ include: z.array(z.string()) }).optional().describe("Up to 500 specific company names"),
    }).optional().describe("Direct company matching by website or name"),
  }).describe("Search filters — at least one include filter is required"),
  page: z.number().optional().default(1).describe("Page number (25 results per page, max 1000 pages)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const result = await client.post<ProspeoSearchPersonResponse>(
    "/search-person",
    { filters: params.filters, page: params.page }
  );
  return { success: !result.error, data: result };
}

export const searchPersonTool: ToolDefinition<Params> = {
  name: "prospeo_search_person",
  description:
    "Search Prospeo's 200M+ contact database with 30+ filters including job title, seniority, location, industry, company size, funding, and tech stack. Returns 25 results per page. Use prospeo_search_suggestions to find valid filter values for locations and job titles. Email/mobile excluded — use prospeo_enrich_person to retrieve.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
