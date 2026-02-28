import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workItems")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});
