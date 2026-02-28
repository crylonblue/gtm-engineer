import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoSearchSuggestionsResponse } from "../types.js";

const parameters = z.object({
  locationSearch: z.string().min(2).optional().describe("Location query (min 2 chars) — returns location suggestions with type (COUNTRY, STATE, CITY, ZONE)"),
  jobTitleSearch: z.string().min(2).optional().describe("Job title query (min 2 chars) — returns up to 25 matching job titles"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const body: Record<string, string> = {};
  if (params.locationSearch) body.location_search = params.locationSearch;
  if (params.jobTitleSearch) body.job_title_search = params.jobTitleSearch;

  const result = await client.post<ProspeoSearchSuggestionsResponse>(
    "/search-suggestions",
    body
  );
  return { success: !result.error, data: result };
}

export const searchSuggestionsTool: ToolDefinition<Params> = {
  name: "prospeo_search_suggestions",
  description:
    "Get valid filter values for Prospeo search endpoints. Provide exactly one of locationSearch or jobTitleSearch. Free — no credits consumed. Use this before search-person/search-company to get exact location or job title strings.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
