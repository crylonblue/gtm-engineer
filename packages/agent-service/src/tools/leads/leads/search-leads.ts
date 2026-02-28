import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { searchLeadsByField, searchLeadsByFilter } from "../client.js";

const parameters = z.object({
  field: z
    .enum(["email", "status", "source", "company", "linkedin"])
    .optional()
    .describe("Single indexed field to search on (fast lookup)"),
  value: z
    .string()
    .optional()
    .describe("Value to match for the single-field search"),
  filters: z
    .object({
      email: z.string().optional(),
      status: z.string().optional(),
      source: z.string().optional(),
      company: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional()
    .describe("Multi-field AND filter for combined searches"),
  limit: z
    .number()
    .optional()
    .default(50)
    .describe("Maximum number of results (default 50)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  if (params.field && params.value) {
    const results = await searchLeadsByField(params.field, params.value, params.limit);
    return { success: true, data: { total: results.length, results } };
  }

  if (params.filters) {
    const results = await searchLeadsByFilter({ ...params.filters, limit: params.limit });
    return { success: true, data: { total: results.length, results } };
  }

  return {
    success: false,
    error: "Provide either field+value for single-field search or filters for multi-field search",
  };
}

export const searchLeadsTool: ToolDefinition<Params> = {
  name: "leads_search",
  description:
    "Search leads in the local database. Use field+value for fast indexed lookups on a single field, or filters for multi-field AND queries.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
