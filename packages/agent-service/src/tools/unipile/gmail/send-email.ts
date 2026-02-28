import { z } from "zod";
import type { ToolDefinition, ToolResult } from "../../types.js";
import { getUnipileClient, getUnipileGmailAccountId } from "../client.js";

const recipientSchema = z.object({
  identifier: z.string().describe("Email address"),
  display_name: z.string().optional().describe("Display name of the recipient"),
});

const parameters = z.object({
  to: z.array(recipientSchema).min(1).describe("List of recipients"),
  subject: z.string().describe("Email subject line"),
  body: z.string().describe("Plain text email body"),
  cc: z.array(recipientSchema).optional().describe("CC recipients"),
  bcc: z.array(recipientSchema).optional().describe("BCC recipients"),
  reply_to: z.string().optional().describe("Provider email ID to reply to (for threading)"),
});

type Params = z.infer<typeof parameters>;

function formatRecipients(recipients: Array<{ identifier: string; display_name?: string }>): string {
  return JSON.stringify(
    recipients.map((r) => ({
      identifier: r.identifier,
      ...(r.display_name ? { display_name: r.display_name } : {}),
    }))
  );
}

async function execute(params: Params): Promise<ToolResult> {
  const client = getUnipileClient();
  const accountId = getUnipileGmailAccountId();

  const formData: Record<string, string> = {
    account_id: accountId,
    to: formatRecipients(params.to),
    subject: params.subject,
    body: params.body,
  };

  if (params.cc && params.cc.length > 0) {
    formData.cc = formatRecipients(params.cc);
  }
  if (params.bcc && params.bcc.length > 0) {
    formData.bcc = formatRecipients(params.bcc);
  }
  if (params.reply_to) {
    formData.reply_to = params.reply_to;
  }

  const data = await client.postForm("/api/v1/emails", formData);
  return { success: true, data };
}

export const sendEmailTool: ToolDefinition<Params> = {
  name: "unipile_gmail_send_email",
  description: "Send an email from the connected Gmail account. Can also reply to an existing thread by providing reply_to.",
  provider: "unipile",
  category: "gmail",
  parameters,
  execute,
};
