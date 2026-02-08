import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Get all clauses for a playbook (ordered)
export const listByPlaybook = query({
  args: { playbookId: v.id("playbooks") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Verify user owns the playbook
    const playbook = await ctx.db.get(args.playbookId);
    if (!playbook || playbook.userId !== userId) return [];

    const clauses = await ctx.db
      .query("clauses")
      .withIndex("by_playbook", (q) => q.eq("playbookId", args.playbookId))
      .collect();

    // Sort by order
    return clauses.sort((a, b) => a.order - b.order);
  },
});

// Get a single clause by ID
export const get = query({
  args: { id: v.id("clauses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const clause = await ctx.db.get(args.id);
    if (!clause || clause.userId !== userId) return null;

    return clause;
  },
});

// Update clause summary section
export const updateSummary = mutation({
  args: {
    id: v.id("clauses"),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clause = await ctx.db.get(args.id);
    if (!clause || clause.userId !== userId) {
      throw new Error("Clause not found");
    }

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Update clause fallback positions
export const updateFallbacks = mutation({
  args: {
    id: v.id("clauses"),
    fallbackPositions: v.array(v.object({
      position: v.string(),
      rationale: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clause = await ctx.db.get(args.id);
    if (!clause || clause.userId !== userId) {
      throw new Error("Clause not found");
    }

    await ctx.db.patch(args.id, {
      fallbackPositions: args.fallbackPositions,
      updatedAt: Date.now(),
    });
  },
});

// Full update for a clause (summary + fallbacks)
export const update = mutation({
  args: {
    id: v.id("clauses"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
    fallbackPositions: v.optional(v.array(v.object({
      position: v.string(),
      rationale: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clause = await ctx.db.get(args.id);
    if (!clause || clause.userId !== userId) {
      throw new Error("Clause not found");
    }

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Reorder clauses
export const reorder = mutation({
  args: {
    playbookId: v.id("playbooks"),
    clauseIds: v.array(v.id("clauses")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user owns the playbook
    const playbook = await ctx.db.get(args.playbookId);
    if (!playbook || playbook.userId !== userId) {
      throw new Error("Playbook not found");
    }

    // Update order for each clause
    for (let i = 0; i < args.clauseIds.length; i++) {
      const clause = await ctx.db.get(args.clauseIds[i]);
      if (clause && clause.playbookId === args.playbookId) {
        await ctx.db.patch(args.clauseIds[i], {
          order: i,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

// Internal mutation to create clauses (used by AI processing)
export const createMany = internalMutation({
  args: {
    playbookId: v.id("playbooks"),
    userId: v.id("users"),
    clauses: v.array(v.object({
      order: v.number(),
      title: v.string(),
      originalText: v.string(),
      summary: v.optional(v.string()),
      description: v.optional(v.string()),
      talkingPoints: v.optional(v.array(v.string())),
      fallbackPositions: v.optional(v.array(v.object({
        position: v.string(),
        rationale: v.optional(v.string()),
      }))),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const createdIds: Id<"clauses">[] = [];

    for (const clause of args.clauses) {
      const id = await ctx.db.insert("clauses", {
        playbookId: args.playbookId,
        userId: args.userId,
        order: clause.order,
        title: clause.title,
        originalText: clause.originalText,
        summary: clause.summary,
        description: clause.description,
        talkingPoints: clause.talkingPoints,
        fallbackPositions: clause.fallbackPositions,
        createdAt: now,
        updatedAt: now,
      });
      createdIds.push(id);
    }

    return createdIds;
  },
});

// Delete a single clause
export const remove = mutation({
  args: { id: v.id("clauses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clause = await ctx.db.get(args.id);
    if (!clause || clause.userId !== userId) {
      throw new Error("Clause not found");
    }

    await ctx.db.delete(args.id);
  },
});

// Add a new clause to a playbook
export const create = mutation({
  args: {
    playbookId: v.id("playbooks"),
    title: v.string(),
    originalText: v.string(),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
    fallbackPositions: v.optional(v.array(v.object({
      position: v.string(),
      rationale: v.optional(v.string()),
    }))),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user owns the playbook
    const playbook = await ctx.db.get(args.playbookId);
    if (!playbook || playbook.userId !== userId) {
      throw new Error("Playbook not found");
    }

    // Get the highest order number
    const existingClauses = await ctx.db
      .query("clauses")
      .withIndex("by_playbook", (q) => q.eq("playbookId", args.playbookId))
      .collect();
    
    const maxOrder = existingClauses.length > 0
      ? Math.max(...existingClauses.map((c) => c.order))
      : -1;

    const now = Date.now();
    return await ctx.db.insert("clauses", {
      playbookId: args.playbookId,
      userId,
      order: maxOrder + 1,
      title: args.title,
      originalText: args.originalText,
      summary: args.summary,
      description: args.description,
      talkingPoints: args.talkingPoints,
      fallbackPositions: args.fallbackPositions,
      createdAt: now,
      updatedAt: now,
    });
  },
});
