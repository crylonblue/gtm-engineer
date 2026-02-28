export interface EmailRecipient {
  identifier: string;
  display_name?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mime_type: string;
  size: number;
}

export interface Email {
  id: string;
  subject: string;
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  body: string;
  html_body?: string;
  read: boolean;
  starred: boolean;
  folder?: string;
  attachments?: EmailAttachment[];
  created_at: string;
  updated_at: string;
}
