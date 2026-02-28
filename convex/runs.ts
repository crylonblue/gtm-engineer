import { query } from "./_generated/server";
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

export const get = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
