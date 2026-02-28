import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  limit: z.number().default(20).describe("Maximum number of chats to return"),
  cursor: z.string().optional().describe("Pagination cursor for fetching next page"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileAccountId();
  let path = `/api/v1/chats?account_id=${encodeURIComponent(accountId)}&limit=${params.limit}`;
  if (params.cursor) {
    path += `&cursor=${encodeURIComponent(params.cursor)}`;
  }
  const data = await client.get(path);
  return { success: true, data };
}

export const listChatsTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_list_chats",
  description: "List LinkedIn chat conversations for the connected account.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
