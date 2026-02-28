import { registerTool } from "../../registry.js";
import { enrichPersonTool } from "./enrich-person.js";
import { bulkEnrichPersonTool } from "./bulk-enrich-person.js";
import { enrichCompanyTool } from "./enrich-company.js";
import { bulkEnrichCompanyTool } from "./bulk-enrich-company.js";
import { searchPersonTool } from "./search-person.js";
import { searchCompanyTool } from "./search-company.js";
import { searchSuggestionsTool } from "./search-suggestions.js";
import { accountInfoTool } from "./account-info.js";

registerTool(enrichPersonTool);
registerTool(bulkEnrichPersonTool);
registerTool(enrichCompanyTool);
registerTool(bulkEnrichCompanyTool);
registerTool(searchPersonTool);
registerTool(searchCompanyTool);
registerTool(searchSuggestionsTool);
registerTool(accountInfoTool);

export {
  enrichPersonTool,
  bulkEnrichPersonTool,
  enrichCompanyTool,
  bulkEnrichCompanyTool,
  searchPersonTool,
  searchCompanyTool,
  searchSuggestionsTool,
  accountInfoTool,
};
