import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { createLead } from "../client.js";

const parameters = z.object({
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

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const id = await createLead(params);
  return { success: true, data: { id, ...params } };
}

export const addLeadTool: ToolDefinition<Params> = {
  name: "leads_add",
  description:
    "Add a new lead to the local leads database. Supports standard fields (email, name, company, status, source) plus a freeform data field for any additional information.",
  provider: "leads",
  category: "leads",
  parameters,
  execute,
};
