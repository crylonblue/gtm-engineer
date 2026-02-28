import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../types.js";
import { listObjects } from "../../storage/r2.js";

const parameters = z.object({
  prefix: z
    .string()
    .default("")
    .describe("Filter results to keys starting with this prefix"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const keys = await listObjects(params.prefix);
  return {
    success: true,
    data: { keys },
  };
}

export const listFilesTool: ToolDefinition<Params> = {
  name: "storage_list",
  description: "List files in persistent storage, optionally filtered by a key prefix.",
  provider: "storage",
  category: "storage",
  parameters,
  execute,
};
