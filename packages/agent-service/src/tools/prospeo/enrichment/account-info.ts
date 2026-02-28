import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getProspeoClient } from "../client.js";
import type { ProspeoAccountInfoResponse } from "../types.js";

const parameters = z.object({});

type Params = z.infer<typeof parameters>;

async function execute(_params: Params): Promise<ToolResult> {
  const client = getProspeoClient();

  const result = await client.get<ProspeoAccountInfoResponse>(
    "/account-information"
  );
  return { success: !result.error, data: result };
}

export const accountInfoTool: ToolDefinition<Params> = {
  name: "prospeo_account_info",
  description:
    "Get Prospeo account information including current plan, remaining/used credits, and next renewal date. Free — no credits consumed.",
  provider: "prospeo",
  category: "enrichment",
  parameters,
  execute,
};
