import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  keywords: z.string().describe("Search keywords for people (name, title, company, etc.)"),
  api: z
    .enum(["classic", "sales_navigator", "recruiter"])
    .default("classic")
    .describe("Which LinkedIn API to use for the search"),
  limit: z.number().default(10).describe("Maximum number of results"),
  url: z
    .string()
    .optional()
    .describe(
      "Optional: pass a full LinkedIn search URL instead of keywords (overrides other filters)"
    ),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileAccountId();

  const body: Record<string, unknown> = {
    api: params.api,
    category: "people",
    keywords: params.keywords,
    limit: params.limit,
  };

  if (params.url) {
    body.url = params.url;
  }

  const data = await client.post(
    `/api/v1/linkedin/search?account_id=${encodeURIComponent(accountId)}`,
    body
  );
  return { success: true, data };
}

export const searchPeopleTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_search_people",
  description:
    "Search for people on LinkedIn by name, title, company, or keywords. Use the 'api' parameter to choose classic LinkedIn, Sales Navigator, or Recruiter search.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
