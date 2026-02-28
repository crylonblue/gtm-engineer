import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { bulkCreateLeads } from "../client.js";

const leadSchema = z.object({
  email: z.string().optional().describe("Lead email address"),
  name: z.string().optional().describe("Lead full name"),
  company: z.string().optional().describe("Company name"),
  status: z.string().optional().describe("Lead status (e.g. new, contacted, qualified)"),
  source: z.string().optional().describe("Lead source (e.g. linkedin, website, referral)"),
  linkedin: z.string().optional().describe("LinkedIn profile URL"),
  data: z
    .record(z.string(), z.any())
    .optional()
    .describe("Additional freeform data as key-value pairs"),
});

const parameters = z.object({
  leads: z
    .array(leadSchema)
    .min(1)
    .max(100)
    .describe("Array of leads to add (1–100)"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const ids = await bulkCreateLeads(params.leads);
  return { success: true, data: { created: ids.length, ids } };
}

export const addLeadsBulkTool: ToolDefinition<Params> = {
  name: "leads_add_bulk",
  description:
    "Add multiple leads to the local leads database in a single operation. Accepts 1–100 leads at once.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
