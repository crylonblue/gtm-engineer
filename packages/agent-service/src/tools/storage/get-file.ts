import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../types.js";
import { getJson, getText } from "../../storage/r2.js";

const parameters = z.object({
  key: z.string().describe("Storage path/key of the file to retrieve"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  // Try JSON first, fall back to text
  const jsonData = await getJson(params.key);
  if (jsonData !== null) {
    return {
      success: true,
      data: { key: params.key, content: jsonData },
    };
  }

  const text = await getText(params.key);
  return {
    success: true,
    data: { key: params.key, content: text },
  };
}

export const getFileTool: ToolDefinition<Params> = {
  name: "storage_get",
  description: "Retrieve a file from persistent storage by its key.",
  provider: "storage",
  category: "storage",
  parameters,
  execute,
};
