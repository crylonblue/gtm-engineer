import type { z } from "zod";

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  provider: string;
  category: string;
  parameters: z.ZodType<TParams>;
  execute: (params: TParams) => Promise<ToolResult<TResult>>;
}

export interface ToolMetadata {
  name: string;
  description: string;
  provider: string;
  category: string;
}
