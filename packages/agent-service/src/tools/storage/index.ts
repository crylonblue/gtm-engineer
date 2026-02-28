import { registerTool } from "../registry.js";
import { saveFileTool } from "./save-file.js";
import { getFileTool } from "./get-file.js";
import { listFilesTool } from "./list-files.js";

registerTool(saveFileTool);
registerTool(getFileTool);
registerTool(listFilesTool);

export { saveFileTool, getFileTool, listFilesTool };
