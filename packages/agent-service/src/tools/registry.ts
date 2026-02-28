import { z } from "zod";
import type { ToolDefinition, ToolMetadata } from "./types.js";

const tools = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  if (tools.has(tool.name)) {
    throw new Error(`Tool already registered: ${tool.name}`);
  }
  tools.set(tool.name, tool);
}

export function getTool(name: string): ToolDefinition | undefined {
  return tools.get(name);
}

export function getToolsByProvider(provider: string): ToolDefinition[] {
  return Array.from(tools.values()).filter((t) => t.provider === provider);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  return Array.from(tools.values()).filter((t) => t.category === category);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(tools.values());
}

export function getToolsForLLM(
  filterNames?: string[]
): Array<{ name: string; description: string; input_schema: Record<string, unknown> }> {
  let list = Array.from(tools.values());
  if (filterNames && filterNames.length > 0) {
    list = list.filter((t) => filterNames.includes(t.name));
  }
  return list.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: z.toJSONSchema(t.parameters) as Record<string, unknown>,
  }));
}

export function getToolMetadata(filterNames?: string[]): ToolMetadata[] {
  let list = Array.from(tools.values());
  if (filterNames && filterNames.length > 0) {
    list = list.filter((t) => filterNames.includes(t.name));
  }
  return list.map((t) => ({
    name: t.name,
    description: t.description,
    provider: t.provider,
    category: t.category,
  }));
}
