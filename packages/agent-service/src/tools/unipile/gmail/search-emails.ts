import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileGmailAccountId } from "../client.js";

const parameters = z.object({
  query: z.string().describe("Search query to filter emails"),
  limit: z.number().default(20).describe("Maximum number of emails to return"),
  cursor: z.string().optional().describe("Pagination cursor for next page of results"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileGmailAccountId();
  const searchParams = new URLSearchParams({
    account_id: accountId,
    q: params.query,
    limit: String(params.limit),
  });
  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  const data = await client.get(`/api/v1/emails?${searchParams.toString()}`);
  return { success: true, data };
}

export const searchEmailsTool: ToolDefinition<Params> = {
  name: "unipile_gmail_search_emails",
  description: "Search emails in the connected Gmail account by query string.",
  provider: "unipile",
  category: "gmail",
  parameters,
  execute,
};
