import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { deleteLead } from "../client.js";

const parameters = z.object({
  id: z.string().describe("Lead ID to delete"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  await deleteLead(params.id);
  return { success: true, data: { deleted: params.id } };
}

export const deleteLeadTool: ToolDefinition<Params> = {
  name: "leads_delete",
  description: "Delete a lead from the local leads database by ID.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
