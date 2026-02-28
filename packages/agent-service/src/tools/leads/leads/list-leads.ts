import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { listLeads } from "../client.js";

const parameters = z.object({
  limit: z
    .number()
    .optional()
    .default(50)
    .describe("Maximum number of leads to return (default 50)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const results = await listLeads(params.limit);
  return { success: true, data: { total: results.length, results } };
}

export const listLeadsTool: ToolDefinition<Params> = {
  name: "leads_list",
  description:
    "List the most recent leads from the local database, ordered by creation date descending.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
