import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../types.js";

const parameters = z.object({
  url: z.string().url().describe("URL to fetch"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const response = await fetch(params.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GTMEngineerBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // Basic HTML to text extraction
  const extractedText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to ~10k chars for LLM
  const text = extractedText.slice(0, 10000);

  return {
    success: true,
    data: {
      text,
      raw: {
        url: params.url,
        html: html.slice(0, 50000),
        extractedText,
      },
    },
  };
}

export const webFetchTool: ToolDefinition<Params> = {
  name: "web_fetch",
  description: "Fetch and extract text content from a URL.",
  provider: "builtin",
  category: "web",
  parameters,
  execute,
};
