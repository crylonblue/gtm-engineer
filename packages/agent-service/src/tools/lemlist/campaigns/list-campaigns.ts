import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  limit: z
    .number()
    .default(100)
    .describe("Maximum number of campaigns to retrieve (max 100)"),
  offset: z.number().optional().describe("Offset from start for pagination"),
  status: z
    .enum(["running", "draft", "archived", "ended", "paused", "errors"])
    .optional()
    .describe("Filter campaigns by status"),
  sortBy: z
    .enum(["createdAt"])
    .optional()
    .describe("Field to sort by"),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .describe("Sort direction"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get("/campaigns", {
    version: "v2",
    limit: params.limit,
    offset: params.offset,
    status: params.status,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
  });
  return { success: true, data };
}

export const listCampaignsTool: ToolDefinition<Params> = {
  name: "lemlist_list_campaigns",
  description:
    "List all Lemlist campaigns with optional filtering by status. Returns campaign names, IDs, statuses, and sender info.",
  provider: "lemlist",
  category: "campaigns",
  parameters,
  execute,
};
