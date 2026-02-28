import { registerTool } from "../../registry.js";
import { searchContactsTool } from "./search-contacts.js";
import { getContactTool } from "./get-contact.js";
import { createContactTool } from "./create-contact.js";
import { updateContactTool } from "./update-contact.js";
import { searchCompaniesTool } from "./search-companies.js";
import { getCompanyTool } from "./get-company.js";
import { createCompanyTool } from "./create-company.js";
import { updateCompanyTool } from "./update-company.js";
import { searchDealsTool } from "./search-deals.js";
import { getDealTool } from "./get-deal.js";
import { createDealTool } from "./create-deal.js";
import { updateDealTool } from "./update-deal.js";
import { createNoteTool } from "./create-note.js";
import { addToListTool } from "./add-to-list.js";

registerTool(searchContactsTool);
registerTool(getContactTool);
registerTool(createContactTool);
registerTool(updateContactTool);
registerTool(searchCompaniesTool);
registerTool(getCompanyTool);
registerTool(createCompanyTool);
registerTool(updateCompanyTool);
registerTool(searchDealsTool);
registerTool(getDealTool);
registerTool(createDealTool);
registerTool(updateDealTool);
registerTool(createNoteTool);
registerTool(addToListTool);

export {
  searchContactsTool,
  getContactTool,
  createContactTool,
  updateContactTool,
  searchCompaniesTool,
  getCompanyTool,
  createCompanyTool,
  updateCompanyTool,
  searchDealsTool,
  getDealTool,
  createDealTool,
  updateDealTool,
  createNoteTool,
  addToListTool,
};
