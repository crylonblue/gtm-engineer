import { registerTool } from "../registry.js";
import { webSearchTool } from "./search.js";

registerTool(webSearchTool);

export { webSearchTool };
