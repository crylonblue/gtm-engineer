import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../types.js";
import { uploadJson, uploadText } from "../../storage/r2.js";

const parameters = z.object({
  key: z.string().describe("Storage path/key for the file"),
  content: z.string().describe("Content to save"),
  format: z
    .enum(["json", "text"])
    .default("text")
    .describe("Storage format: 'json' parses content as JSON, 'text' stores as-is"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  if (params.format === "json") {
    const data = JSON.parse(params.content);
    await uploadJson(params.key, data);
  } else {
    await uploadText(params.key, params.content);
  }

  return {
    success: true,
    data: { key: params.key },
  };
}

export const saveFileTool: ToolDefinition<Params> = {
  name: "storage_save",
  description: "Save content to persistent storage. Use format 'json' to store structured data or 'text' for plain text.",
  provider: "storage",
  category: "storage",
  parameters,
  execute,
};
