import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().describe("Campaign ID the lead belongs to"),
  leadId: z.string().describe("Unique lead identifier"),
  action: z
    .enum(["remove", "unsubscribe"])
    .default("unsubscribe")
    .describe("'remove' deletes permanently; 'unsubscribe' only unsubscribes from the campaign"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.delete(
    `/campaigns/${encodeURIComponent(params.campaignId)}/leads/${encodeURIComponent(params.leadId)}`,
    params.action === "remove" ? { action: "remove" } : undefined
  );
  return { success: true, data };
}

export const deleteLeadTool: ToolDefinition<Params> = {
  name: "lemlist_delete_lead",
  description:
    "Remove or unsubscribe a lead from a Lemlist campaign. Use action 'remove' to delete permanently or 'unsubscribe' to only unsubscribe.",
  provider: "lemlist",
  category: "leads",
  parameters,
  execute,
};
