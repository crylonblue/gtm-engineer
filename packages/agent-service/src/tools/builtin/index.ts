import { registerTool } from "../registry.js";
import { webFetchTool } from "./web-fetch.js";

registerTool(webFetchTool);

export { webFetchTool };
