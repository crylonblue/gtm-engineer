"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

let client: ConvexReactClient | null = null;

function getClient() {
  if (!client && process.env.NEXT_PUBLIC_CONVEX_URL) {
    client = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  }
  return client;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convex = getClient();
  if (!convex) return <>{children}</>;
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
