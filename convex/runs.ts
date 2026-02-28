import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    return runs.sort((a, b) => b.startedAt - a.startedAt);
  },
});

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("runs")
      .withIndex("by_startedAt")
      .order("desc")
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    agentId: v.union(v.id("agents"), v.string()),
    trigger: v.union(v.literal("schedule"), v.literal("manual")),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("runs"),
    status: v.optional(v.union(v.literal("running"), v.literal("completed"), v.literal("failed"))),
    phase: v.optional(v.string()),
    completedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    messageCount: v.optional(v.number()),
    toolUseCount: v.optional(v.number()),
    error: v.optional(v.string()),
    tasks: v.optional(v.number()),
    discovered: v.optional(v.number()),
    processed: v.optional(v.number()),
    failed: v.optional(v.number()),
    skipped: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});
