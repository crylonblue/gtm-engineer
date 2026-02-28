import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("leads", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const bulkCreate = mutation({
  args: {
    leads: v.array(
      v.object({
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        status: v.optional(v.string()),
        source: v.optional(v.string()),
        data: v.optional(v.any()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids: string[] = [];
    for (const lead of args.leads) {
      const id = await ctx.db.insert("leads", {
        ...lead,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

export const get = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("leads"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, data, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error(`Lead not found: ${id}`);
    const mergedData = data ? { ...existing.data, ...data } : undefined;
    await ctx.db.patch(id, {
      ...fields,
      ...(mergedData !== undefined && { data: mergedData }),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("leads")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});

export const searchByField = query({
  args: {
    field: v.union(
      v.literal("email"),
      v.literal("status"),
      v.literal("source"),
      v.literal("company"),
      v.literal("linkedin")
    ),
    value: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const indexName = `by_${args.field}` as
      | "by_email"
      | "by_status"
      | "by_source"
      | "by_company"
      | "by_linkedin";
    return await ctx.db
      .query("leads")
      .withIndex(indexName, (q) => q.eq(args.field, args.value))
      .take(limit);
  },
});

export const searchByFilter = query({
  args: {
    email: v.optional(v.string()),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    company: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { limit: rawLimit, ...filters } = args;
    const limit = rawLimit ?? 50;

    // Pick the first available indexed field for the initial query
    const indexFields = ["email", "status", "source", "company", "linkedin"] as const;
    let bestField: (typeof indexFields)[number] | null = null;
    for (const f of indexFields) {
      if (filters[f]) {
        bestField = f;
        break;
      }
    }

    let results;
    if (bestField) {
      const indexName = `by_${bestField}` as
        | "by_email"
        | "by_status"
        | "by_source"
        | "by_company"
        | "by_linkedin";
      const value = filters[bestField]!;
      results = await ctx.db
        .query("leads")
        .withIndex(indexName, (q) => q.eq(bestField!, value))
        .collect();
    } else {
      results = await ctx.db.query("leads").collect();
    }

    // Apply remaining filters in memory
    const filtered = results.filter((lead) => {
      for (const [key, value] of Object.entries(filters)) {
        if (value && lead[key as keyof typeof lead] !== value) return false;
      }
      return true;
    });

    return filtered.slice(0, limit);
  },
});
