import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  email: z
    .string()
    .describe("Email address or domain to add to the unsubscribe list"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.post(
    `/unsubscribes/${encodeURIComponent(params.email)}`
  );
  return { success: true, data };
}

export const addUnsubscribeTool: ToolDefinition<Params> = {
  name: "lemlist_add_unsubscribe",
  description:
    "Add an email address or domain to the Lemlist unsubscribe list. Prevents future outreach to this address.",
  provider: "lemlist",
  category: "unsubscribes",
  parameters,
  execute,
};
