import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  identifier: z.string().describe("LinkedIn profile identifier (user ID or profile URL)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileAccountId();
  const data = await client.get(
    `/api/v1/users/${encodeURIComponent(params.identifier)}?account_id=${encodeURIComponent(accountId)}`
  );
  return { success: true, data };
}

export const getProfileTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_get_profile",
  description: "Get a LinkedIn user's full profile by their identifier or profile URL.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
