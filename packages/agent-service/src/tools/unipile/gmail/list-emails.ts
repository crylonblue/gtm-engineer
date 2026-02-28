import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileGmailAccountId } from "../client.js";

const parameters = z.object({
  limit: z.number().default(20).describe("Maximum number of emails to return"),
  cursor: z.string().optional().describe("Pagination cursor for next page of results"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileGmailAccountId();
  const searchParams = new URLSearchParams({
    account_id: accountId,
    limit: String(params.limit),
  });
  if (params.cursor) {
    searchParams.set("cursor", params.cursor);
  }
  const data = await client.get(`/api/v1/emails?${searchParams.toString()}`);
  return { success: true, data };
}

export const listEmailsTool: ToolDefinition<Params> = {
  name: "unipile_gmail_list_emails",
  description: "List recent emails from the connected Gmail account.",
  provider: "unipile",
  category: "gmail",
  parameters,
  execute,
};
