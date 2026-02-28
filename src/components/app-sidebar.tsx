"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import { Logo } from "@/components/common/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navItems } from "@/config/navigation";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function AppSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnChat = pathname.startsWith("/chat");
  const activeConvId = searchParams.get("c");

  const conversations = useQuery(api.conversations.list);
  const removeConversation = useMutation(api.conversations.remove);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Logo size={16} />
                </div>
                <span className="font-serif text-lg font-semibold">GTM Agent</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {item.href === "/chat" && isOnChat && (
                      <>
                        {conversations && conversations.length > 0 && (
                          <SidebarMenuSub>
                            {conversations.map((conv) => (
                              <SidebarMenuSubItem key={conv._id}>
                                <SidebarMenuSubButton
                                  asChild
                                  size="sm"
                                  isActive={activeConvId === conv._id}
                                >
                                  <Link href={`/chat?c=${conv._id}`}>
                                    <span className="truncate flex-1">
                                      {conv.title}
                                    </span>
                                    <span className="text-muted-foreground text-[10px] shrink-0">
                                      {formatRelativeTime(conv.lastMessageAt)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeConversation({ id: conv._id });
                                      }}
                                      className="shrink-0 opacity-0 group-hover/menu-sub-item:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
