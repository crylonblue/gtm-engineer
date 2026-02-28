import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  email: z.string().email().describe("Email address of the lead to look up"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get(
    `/leads/${encodeURIComponent(params.email)}`,
    { version: "v2" }
  );
  return { success: true, data };
}

export const getLeadTool: ToolDefinition<Params> = {
  name: "lemlist_get_lead",
  description:
    "Get a lead by email address from Lemlist. Returns all campaigns the lead is part of, their state, status, and custom variables.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
