"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navItems } from "@/config/navigation";

function getBreadcrumbs(pathname: string) {
  if (pathname === "/") {
    return [{ title: "Dashboard", href: "/" }];
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const navItem = navItems.find((item) => item.href === href);
    const title =
      navItem?.title ?? segment.charAt(0).toUpperCase() + segment.slice(1);
    return { title, href };
  });
}

const linkActions: Record<string, { label: string; href: string }> = {
  "/agents": { label: "New Agent", href: "/agents/new" },
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);
  const createConversation = useMutation(api.conversations.create);

  const isOnChat = pathname.startsWith("/chat");
  const linkAction = Object.entries(linkActions).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  const handleNewChat = async () => {
    const id = await createConversation({ title: "New conversation" });
    router.push(`/chat?c=${id}`);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.title}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {isOnChat && (
        <Button size="sm" className="ml-auto" onClick={handleNewChat}>
          <Plus />
          New Chat
        </Button>
      )}
      {linkAction && (
        <Button size="sm" className="ml-auto" asChild>
          <Link href={linkAction.href}>
            <Plus />
            {linkAction.label}
          </Link>
        </Button>
      )}
    </header>
  );
}
