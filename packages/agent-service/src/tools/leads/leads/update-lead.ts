import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { updateLead } from "../client.js";

const parameters = z.object({
  id: z.string().describe("Lead ID to update"),
  email: z.string().optional().describe("Updated email address"),
  name: z.string().optional().describe("Updated full name"),
  company: z.string().optional().describe("Updated company name"),
  status: z.string().optional().describe("Updated status (e.g. new, contacted, qualified)"),
  source: z.string().optional().describe("Updated source (e.g. linkedin, website, referral)"),
  linkedin: z.string().optional().describe("Updated LinkedIn profile URL"),
  data: z
    .record(z.string(), z.any())
    .optional()
    .describe("Additional data to merge into the existing data field"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const updated = await updateLead(params);
  return { success: true, data: updated };
}

export const updateLeadTool: ToolDefinition<Params> = {
  name: "leads_update",
  description:
    "Update an existing lead in the local leads database. The data field is deep-merged with any existing data, so existing keys are preserved.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
