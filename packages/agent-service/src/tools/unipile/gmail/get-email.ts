import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  email_id: z.string().describe("The ID of the email to retrieve"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.get(`/api/v1/emails/${encodeURIComponent(params.email_id)}`);
  return { success: true, data };
}

export const getEmailTool: ToolDefinition<Params> = {
  name: "unipile_gmail_get_email",
  description: "Get the full details of a specific email by its ID.",
  provider: "unipile",
  category: "gmail",
  parameters,
  execute,
};
