import { registerTool } from "../../registry.js";
import { listCampaignsTool } from "./list-campaigns.js";
import { getCampaignTool } from "./get-campaign.js";
import { getCampaignStatsTool } from "./get-campaign-stats.js";
import { pauseCampaignTool } from "./pause-campaign.js";
import { startCampaignTool } from "./start-campaign.js";

registerTool(listCampaignsTool);
registerTool(getCampaignTool);
registerTool(getCampaignStatsTool);
registerTool(pauseCampaignTool);
registerTool(startCampaignTool);

export {
  listCampaignsTool,
  getCampaignTool,
  getCampaignStatsTool,
  pauseCampaignTool,
  startCampaignTool,
};
