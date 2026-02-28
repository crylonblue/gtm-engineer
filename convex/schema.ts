import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    prompt: v.optional(v.string()),
    role: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused")),
    hours: v.optional(v.number()),
    cron: v.optional(v.string()),
    guardrails: v.optional(v.string()),
    heartbeat: v.optional(v.string()),
    tools: v.array(v.string()),
    createdAt: v.optional(v.number()),
    lastRun: v.optional(v.number()),
    lastRunAt: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
  }).index("by_status", ["status"]),
  conversations: defineTable({
    title: v.string(),
    agentId: v.optional(v.id("agents")),
    lastMessageAt: v.number(),
  })
    .index("by_lastMessage", ["lastMessageAt"])
    .index("by_agent", ["agentId"]),
  runs: defineTable({
    agentId: v.union(v.id("agents"), v.string()),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    phase: v.optional(v.string()),
    trigger: v.union(v.literal("schedule"), v.literal("manual")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    error: v.optional(v.string()),
    messageCount: v.optional(v.number()),
    toolUseCount: v.optional(v.number()),
    tasks: v.optional(v.number()),
    discovered: v.optional(v.number()),
    processed: v.optional(v.number()),
    failed: v.optional(v.number()),
    skipped: v.optional(v.number()),
  })
    .index("by_agent", ["agentId"])
    .index("by_startedAt", ["startedAt"]),
  workItems: defineTable({
    runId: v.id("runs"),
    itemKey: v.string(),
    itemType: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("dead_letter"),
      v.literal("skipped")
    ),
  }).index("by_run", ["runId"]),
  runMessages: defineTable({
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
  }).index("by_run", ["runId"]),
  leads: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    data: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_company", ["company"])
    .index("by_linkedin", ["linkedin"])
    .index("by_createdAt", ["createdAt"]),
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
