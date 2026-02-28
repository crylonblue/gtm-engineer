/**
 * Bridge between existing Zod-based ToolDefinition and pi-agent-core's AgentTool format.
 * Converts tools at runtime so we don't need to rewrite every tool file.
 */
import { z } from "zod";
import { Type, type TSchema } from "@mariozechner/pi-ai";
import type { AgentTool, AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ToolDefinition } from "./types.js";

/**
 * Convert a Zod schema to a TypeBox-compatible JSON Schema object.
 * pi-agent-core uses TypeBox schemas, but under the hood it just needs
 * a valid JSON Schema with the right structure.
 */
function zodToTypeBoxSchema(zodSchema: z.ZodType): TSchema {
  const jsonSchema = z.toJSONSchema(zodSchema) as Record<string, unknown>;
  // Remove $schema — Zod v4 emits "https://json-schema.org/draft/2020-12/schema"
  // which AJV (used by pi-agent-core for validation) does not support.
  delete jsonSchema.$schema;
  // TypeBox schemas are just JSON Schema objects with a Symbol.
  // We can use Type.Unsafe to wrap an arbitrary JSON Schema.
  return Type.Unsafe(jsonSchema);
}

/**
 * Convert a Zod-based ToolDefinition to a pi-agent-core AgentTool.
 */
export function toAgentTool(tool: ToolDefinition): AgentTool {
  const schema = zodToTypeBoxSchema(tool.parameters);

  return {
    name: tool.name,
    label: tool.name,
    description: tool.description,
    parameters: schema,
    execute: async (
      _toolCallId: string,
      params: unknown,
    ): Promise<AgentToolResult<unknown>> => {
      // Validate with Zod (keeps existing validation logic)
      const parsed = tool.parameters.parse(params);
      const result = await tool.execute(parsed);

      if (result.success) {
        const data = result.data as { text?: string } | undefined;
        const text = data?.text ?? JSON.stringify(result.data);
        return {
          content: [{ type: "text", text }],
          details: result.data,
        };
      } else {
        return {
          content: [{ type: "text", text: `Tool error: ${result.error}` }],
          details: { error: result.error },
        };
      }
    },
  };
}

/**
 * Convert an array of Zod-based ToolDefinitions to pi-agent-core AgentTools.
 */
export function toAgentTools(
  tools: ToolDefinition[],
  filterNames?: string[],
): AgentTool[] {
  let list = tools;
  if (filterNames && filterNames.length > 0) {
    list = list.filter((t) => filterNames.includes(t.name));
  }
  return list.map(toAgentTool);
}
