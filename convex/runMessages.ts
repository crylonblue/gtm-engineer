import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByRun = query({
  args: { runId: v.id("runs") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("runMessages")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});
