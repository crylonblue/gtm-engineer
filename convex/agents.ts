import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    prompt: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused")),
    hours: v.number(),
    cron: v.optional(v.string()),
    guardrails: v.optional(v.string()),
    tools: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"))),
    hours: v.optional(v.number()),
    cron: v.optional(v.string()),
    guardrails: v.optional(v.string()),
    tools: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const updateLastRun = mutation({
  args: {
    id: v.id("agents"),
    lastRunAt: v.number(),
    lastStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
