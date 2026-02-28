import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileAccountId } from "../client.js";

const parameters = z.object({
  provider_id: z.string().describe("LinkedIn user ID to invite"),
  message: z.string().optional().describe("Optional personalized invitation message"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const body: Record<string, unknown> = {
    account_id: getUnipileAccountId(),
    provider_id: params.provider_id,
  };
  if (params.message) {
    body.message = params.message;
  }
  const data = await client.post("/api/v1/users/invite", body);
  return { success: true, data };
}

export const sendInvitationTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_send_invitation",
  description: "Send a LinkedIn connection invitation to a user.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
