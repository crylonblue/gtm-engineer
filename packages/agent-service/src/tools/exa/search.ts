import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../types.js";
import { getExaClient } from "./client.js";

const parameters = z.object({
  query: z.string().describe("Search query"),
  numResults: z.number().default(5).describe("Number of results to return"),
});

type Params = z.infer<typeof parameters>;

interface ExaSearchResponse {
  results: Array<{ title: string; url: string; text?: string; publishedDate?: string }>;
}

async function execute(params: Params): Promise<ToolResult> {
  const client = getExaClient();

  const data = await client.request<ExaSearchResponse>("/search", {
    query: params.query,
    numResults: params.numResults,
    contents: { text: true },
  });

  const text = data.results
    .map((r) => `**${r.title}**\n${r.url}\n${r.text ?? ""}`)
    .join("\n\n---\n\n");

  return { success: true, data: { text, raw: data } };
}

export const webSearchTool: ToolDefinition<Params> = {
  name: "web_search",
  description: "Search the web using Exa. Returns relevant results for a query.",
  provider: "exa",
  category: "search",
  parameters,
  execute,
};
