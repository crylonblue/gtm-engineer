import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  chat_id: z.string().describe("Chat/conversation ID"),
  limit: z.number().default(50).describe("Maximum number of messages to return"),
  cursor: z.string().optional().describe("Pagination cursor for fetching next page"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  let path = `/api/v1/chats/${encodeURIComponent(params.chat_id)}/messages?limit=${params.limit}`;
  if (params.cursor) {
    path += `&cursor=${encodeURIComponent(params.cursor)}`;
  }
  const data = await client.get(path);
  return { success: true, data };
}

export const getChatMessagesTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_get_chat_messages",
  description: "Get messages from a specific LinkedIn chat/conversation.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
