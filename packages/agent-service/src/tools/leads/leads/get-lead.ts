import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLead } from "../client.js";

const parameters = z.object({
  id: z.string().describe("Lead ID"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const lead = await getLead(params.id);
  if (!lead) {
    return { success: false, error: `Lead not found: ${params.id}` };
  }
  return { success: true, data: lead };
}

export const getLeadTool: ToolDefinition<Params> = {
  name: "leads_get",
  description: "Get a single lead by its ID from the local leads database.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
