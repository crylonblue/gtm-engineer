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
});
