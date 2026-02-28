import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Plug,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Agents",
    href: "/agents",
    icon: Bot,
  },
{
    title: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
];
