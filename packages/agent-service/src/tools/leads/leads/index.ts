import { registerTool } from "../../registry.js";
import { addLeadTool } from "./add-lead.js";
import { addLeadsBulkTool } from "./add-leads-bulk.js";
import { getLeadTool } from "./get-lead.js";
import { updateLeadTool } from "./update-lead.js";
import { searchLeadsTool } from "./search-leads.js";
import { listLeadsTool } from "./list-leads.js";
import { deleteLeadTool } from "./delete-lead.js";

registerTool(addLeadTool);
registerTool(addLeadsBulkTool);
registerTool(getLeadTool);
registerTool(updateLeadTool);
registerTool(searchLeadsTool);
registerTool(listLeadsTool);
registerTool(deleteLeadTool);

export {
  addLeadTool,
  addLeadsBulkTool,
  getLeadTool,
  updateLeadTool,
  searchLeadsTool,
  listLeadsTool,
  deleteLeadTool,
};
