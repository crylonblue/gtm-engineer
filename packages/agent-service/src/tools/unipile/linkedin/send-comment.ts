import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  post_id: z.string().describe("LinkedIn post ID to comment on"),
  text: z.string().describe("Comment text"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post(`/api/v1/posts/${encodeURIComponent(params.post_id)}/comments`, {
    text: params.text,
  });
  return { success: true, data };
}

export const sendCommentTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_send_comment",
  description: "Add a comment to a LinkedIn post.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
