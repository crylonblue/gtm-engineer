import { registerTool } from "../../registry.js";
import { listUnsubscribesTool } from "./list-unsubscribes.js";
import { addUnsubscribeTool } from "./add-unsubscribe.js";

registerTool(listUnsubscribesTool);
registerTool(addUnsubscribeTool);

export { listUnsubscribesTool, addUnsubscribeTool };
