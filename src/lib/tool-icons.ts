import {
  Megaphone,
  UserPlus,
  BarChart3,
  Search,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

const toolIconMap: Record<string, LucideIcon> = {
  createCampaign: Megaphone,
  enrollLeads: UserPlus,
  getCampaignStats: BarChart3,
  searchLeads: Search,
  getLeadDetails: User,
};

export function getToolIcon(toolName: string): LucideIcon {
  return toolIconMap[toolName] ?? Zap;
}
