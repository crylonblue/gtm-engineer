import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient } from "../client.js";

const parameters = z.object({
  id: z.string().describe("LinkedIn company ID or vanity name"),
});

type Params = z.infer<typeof parameters>;

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const data = await client.get(`/api/v1/linkedin/company/${encodeURIComponent(params.id)}`);
  return { success: true, data };
}

export const getCompanyProfileTool: ToolDefinition<Params> = {
  name: "unipile_linkedin_get_company_profile",
  description: "Get a LinkedIn company's full profile by its ID or vanity name.",
  provider: "unipile",
  category: "linkedin",
  parameters,
  execute,
};
