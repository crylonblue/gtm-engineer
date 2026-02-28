import { registerTool } from "../../registry.js";
import { listCampaignLeadsTool } from "./list-campaign-leads.js";
import { createLeadTool } from "./create-lead.js";
import { getLeadTool } from "./get-lead.js";
import { updateLeadTool } from "./update-lead.js";
import { deleteLeadTool } from "./delete-lead.js";
import { markLeadInterestedTool } from "./mark-lead-interested.js";
import { markLeadNotInterestedTool } from "./mark-lead-not-interested.js";

registerTool(listCampaignLeadsTool);
registerTool(createLeadTool);
registerTool(getLeadTool);
registerTool(updateLeadTool);
registerTool(deleteLeadTool);
registerTool(markLeadInterestedTool);
registerTool(markLeadNotInterestedTool);

export {
  listCampaignLeadsTool,
  createLeadTool,
  getLeadTool,
  updateLeadTool,
  deleteLeadTool,
  markLeadInterestedTool,
  markLeadNotInterestedTool,
};
