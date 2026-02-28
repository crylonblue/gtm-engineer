// Import providers to trigger auto-registration
import "./exa/index.js";
import "./builtin/index.js";
import "./unipile/index.js";
import "./hubspot/index.js";
import "./prospeo/index.js";
import "./leads/index.js";
import "./lemlist/index.js";
import "./storage/index.js";

// Re-export registry functions and types
export {
  registerTool,
  getTool,
  getToolsByProvider,
  getToolsByCategory,
  getAllTools,
  getToolsForLLM,
  getToolMetadata,
} from "./registry.js";

export type { ToolDefinition, ToolResult, ToolMetadata } from "./types.js";
