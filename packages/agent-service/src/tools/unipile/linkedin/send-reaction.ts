import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  post_id: z.string().describe("LinkedIn post ID to react to"),
  reaction_type: z.string().default("LIKE").describe("Reaction type (e.g. LIKE, CELEBRATE, SUPPORT, LOVE, INSIGHTFUL, FUNNY)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileAccountId();
  const data = await client.post(
    `/api/v1/posts/${encodeURIComponent(params.post_id)}/reactions?account_id=${encodeURIComponent(accountId)}`,
    { reaction_type: params.reaction_type }
  );
  return { success: true, data };
}

export const sendReactionTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_send_reaction",
  description: "Add a reaction to a LinkedIn post.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
