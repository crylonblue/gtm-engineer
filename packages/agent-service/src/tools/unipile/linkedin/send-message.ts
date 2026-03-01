import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  chat_id: z.string().describe("Chat/conversation ID to send the message to"),
  text: z.string().describe("Message text to send"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post(
    `/api/v1/chats/${encodeURIComponent(params.chat_id)}/messages`,
    { text: params.text }
  );
  return { success: true, data };
}

export const sendMessageTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_send_message",
  description: "Send a message in an existing LinkedIn chat/conversation.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
