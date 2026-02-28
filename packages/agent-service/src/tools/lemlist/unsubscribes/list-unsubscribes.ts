import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getLemlistClient } from "../client.js";

const parameters = z.object({
  offset: z.number().optional().describe("Number of records to skip for pagination"),
  limit: z
    .number()
    .default(100)
    .describe("Maximum number of unsubscribes to retrieve"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getLemlistClient();
  const data = await client.get("/unsubscribes", {
    offset: params.offset,
    limit: params.limit,
  });
  return { success: true, data };
}

export const listUnsubscribesTool: ToolDefinition<Params> = {
  name: "lemlist_list_unsubscribes",
  description:
    "List all unsubscribed email addresses and domains from Lemlist.",
  provider: "lemlist",
  category: "unsubscribes",
  parameters,
  execute,
};
