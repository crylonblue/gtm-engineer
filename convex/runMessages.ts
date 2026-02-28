import { query, mutation } from "./_generated/server";
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

export const create = mutation({
  args: {
    runId: v.id("runs"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    toolCalls: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          args: v.string(),
          status: v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("complete"),
            v.literal("error")
          ),
          result: v.optional(v.string()),
        })
      )
    ),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runMessages", args);
  },
});
