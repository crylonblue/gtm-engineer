import { registerTool } from "../../registry.js";
import { listEmailsTool } from "./list-emails.js";
import { getEmailTool } from "./get-email.js";
import { sendEmailTool } from "./send-email.js";
import { searchEmailsTool } from "./search-emails.js";

registerTool(listEmailsTool);
registerTool(getEmailTool);
registerTool(sendEmailTool);
registerTool(searchEmailsTool);

export { listEmailsTool, getEmailTool, sendEmailTool, searchEmailsTool };
