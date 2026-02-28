import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  text: z.string().describe("Post content text"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.post("/api/v1/posts", {
    account_id: getUnipileAccountId(),
    text: params.text,
  });
  return { success: true, data };
}

export const createPostTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_create_post",
  description: "Create a new LinkedIn post.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
