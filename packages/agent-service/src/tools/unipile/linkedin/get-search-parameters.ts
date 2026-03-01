import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  type: z
    .enum(["LOCATION", "INDUSTRY", "SKILL", "SCHOOL", "COMPANY", "TITLE", "FIRSTNAME", "LASTNAME"])
    .describe(
      "The type of search parameter to retrieve IDs for (e.g. LOCATION to get location IDs, INDUSTRY for industry IDs)"
    ),
  keywords: z.string().describe("Keywords to search for within the parameter type (e.g. 'San Francisco' for LOCATION, 'Software' for INDUSTRY)"),
  limit: z.number().default(20).describe("Maximum number of results to return"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileAccountId();

  const searchParams = new URLSearchParams({
    account_id: accountId,
    type: params.type,
    keywords: params.keywords,
    limit: String(params.limit),
  });

  const data = await client.get(
    `/api/v1/linkedin/search/parameters?${searchParams.toString()}`
  );
  return { success: true, data };
}

export const getSearchParametersTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_get_search_parameters",
  description:
    "Retrieve LinkedIn search parameter IDs for use in filtered searches. LinkedIn requires IDs (not raw text) for filters like location, industry, and skill. Use this tool first to convert text (e.g. 'San Francisco') into the ID that LinkedIn search accepts.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
