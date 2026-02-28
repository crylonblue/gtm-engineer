import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const save = mutation({
  args: {
    conversationId: v.id("conversations"),
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
    isStreaming: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
    return await ctx.db.insert("messages", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    content: v.optional(v.string()),
    isStreaming: v.optional(v.boolean()),
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
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});
