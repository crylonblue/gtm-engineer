import {
  Upload,
  Download,
  FolderOpen,
  Mail,
  Megaphone,
  Play,
  Pause,
  BarChart3,
  UserPlus,
  UserMinus,
  Users,
  Building2,
  User,
  Handshake,
  StickyNote,
  Search,
  Linkedin,
  Inbox,
  Send,
  MessageSquare,
  Heart,
  Database,
  Sparkles,
  Globe,
  ExternalLink,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Exact tool name → icon */
const exactMap: Record<string, LucideIcon> = {
  // Storage
  storage_save: Upload,
  storage_get: Download,
  storage_list: FolderOpen,

  // Builtin
  web_fetch: ExternalLink,

  // Exa
  web_search: Globe,

  // Lemlist — specific overrides
  lemlist_create_lead: UserPlus,
  lemlist_delete_lead: UserMinus,
  lemlist_start_campaign: Play,
  lemlist_pause_campaign: Pause,
  lemlist_get_campaign_stats: BarChart3,
  lemlist_mark_lead_interested: Heart,
  lemlist_mark_lead_not_interested: UserMinus,
  lemlist_add_unsubscribe: UserMinus,

  // HubSpot — specific overrides
  hubspot_create_contact: UserPlus,
  hubspot_get_contact: User,
  hubspot_update_contact: User,
  hubspot_search_contacts: Search,
  hubspot_create_deal: Handshake,
  hubspot_get_deal: Handshake,
  hubspot_update_deal: Handshake,
  hubspot_search_deals: Search,
  hubspot_create_note: StickyNote,
  hubspot_search_companies: Search,

  // Unipile LinkedIn — specific overrides
  unipile_linkedin_send_message: Send,
  unipile_linkedin_send_invitation: UserPlus,
  unipile_linkedin_send_comment: MessageSquare,
  unipile_linkedin_send_reaction: Heart,
  unipile_linkedin_search_people: Search,
  unipile_linkedin_search_companies: Search,
  unipile_linkedin_get_company_profile: Building2,

  // Unipile Gmail — specific overrides
  unipile_gmail_send_email: Send,
  unipile_gmail_search_emails: Search,

  // Leads — specific overrides
  leads_search: Search,
  leads_add: UserPlus,
  leads_add_bulk: Users,
  leads_delete: UserMinus,

  // Prospeo — specific overrides
  prospeo_search_person: Search,
  prospeo_search_company: Search,
  prospeo_search_suggestions: Search,
};

/** Prefix → fallback icon (checked in order) */
const prefixMap: [string, LucideIcon][] = [
  ["storage_", FolderOpen],
  ["lemlist_", Mail],
  ["hubspot_", Building2],
  ["unipile_linkedin_", Linkedin],
  ["unipile_gmail_", Inbox],
  ["leads_", Database],
  ["prospeo_", Sparkles],
];

export function getToolIcon(toolName: string): LucideIcon {
  if (exactMap[toolName]) return exactMap[toolName];

  for (const [prefix, icon] of prefixMap) {
    if (toolName.startsWith(prefix)) return icon;
  }

  return Zap;
}
