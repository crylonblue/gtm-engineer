import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  campaignId: z.string().optional().describe("Filter activities by campaign ID"),
  leadId: z.string().optional().describe("Filter activities by lead ID"),
  contactId: z.string().optional().describe("Filter activities by contact ID"),
  type: z
    .string()
    .optional()
    .describe("Filter by activity type (e.g. emailsOpened, paused, manualDone)"),
  isFirst: z.boolean().optional().describe("Filter for first activity only"),
  limit: z
    .number()
    .default(100)
    .describe("Maximum number of activities to retrieve (max 100)"),
  offset: z.number().optional().describe("Number of records to skip for pagination"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get("/activities", {
    version: "v2",
    campaignId: params.campaignId,
    leadId: params.leadId,
    contactId: params.contactId,
    type: params.type,
    isFirst: params.isFirst,
    limit: params.limit,
    offset: params.offset,
  });
  return { success: true, data };
}

export const listActivitiesTool: ToolDefinition<Params> = {
  name: "lemlist_list_activities",
  description:
    "List campaign activities from Lemlist. Returns activity history including emails opened, replies, pauses, and manual actions. Filterable by campaign, lead, or activity type.",
  provider: "lemlist",
  category: "activities",
  parameters,
  execute,
};
