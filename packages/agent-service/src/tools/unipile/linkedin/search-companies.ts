import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  query: z.string().describe("Search query for companies"),
  limit: z.number().default(10).describe("Maximum number of results"),
  category: z.literal("COMPANIES").default("COMPANIES"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post("/api/v1/linkedin/search", {
    query: params.query,
    limit: params.limit,
    category: "COMPANIES",
  });
  return { success: true, data };
}

export const searchCompaniesTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_search_companies",
  description: "Search for companies on LinkedIn by name, industry, or keywords.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
