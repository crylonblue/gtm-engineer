import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  query: z.string().describe("Search query for people"),
  limit: z.number().default(10).describe("Maximum number of results"),
  category: z.literal("PEOPLE").default("PEOPLE"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post("/api/v1/linkedin/search", {
    query: params.query,
    limit: params.limit,
    category: "PEOPLE",
  });
  return { success: true, data };
}

export const searchPeopleTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_search_people",
  description: "Search for people on LinkedIn by name, title, company, or keywords.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
