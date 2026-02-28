import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    prompt: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused")),
    hours: v.number(),
    cron: v.optional(v.string()),
    guardrails: v.optional(v.string()),
    tools: v.array(v.string()),
    lastRun: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
  }),
  conversations: defineTable({
    title: v.string(),
    agentId: v.optional(v.id("agents")),
    lastMessageAt: v.number(),
  }).index("by_lastMessage", ["lastMessageAt"]),
  messages: defineTable({
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
  }).index("by_conversation", ["conversationId"]),
});
