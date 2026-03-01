import {
  LayoutDashboard,
  Bot,
  HardDrive,
  Blocks,
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
    title: "Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: Blocks,
  },
  {
    title: "Storage",
    href: "/storage",
    icon: HardDrive,
  },
];
