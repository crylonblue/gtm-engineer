import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  post_id: z.string().describe("LinkedIn post ID to comment on"),
  text: z.string().describe("Comment text"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  console.log(`[sendComment] post_id=${params.post_id}, text=${params.text.substring(0, 80)}...`);
  const client = getUnipileClient();
  const path = `/api/v1/posts/${encodeURIComponent(params.post_id)}/comments`;
  const data = await client.post(path, { text: params.text });
  console.log(`[sendComment] success:`, JSON.stringify(data).substring(0, 200));
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
