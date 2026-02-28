import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  attendees_ids: z.array(z.string()).describe("List of LinkedIn user IDs to start a chat with"),
  text: z.string().describe("Initial message text"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post("/api/v1/chats", {
    account_id: getUnipileAccountId(),
    attendees_ids: params.attendees_ids,
    text: params.text,
  });
  return { success: true, data };
}

export const startChatTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_start_chat",
  description: "Start a new LinkedIn chat/conversation with one or more users.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
