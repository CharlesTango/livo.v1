import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all matters for the current user
export const list = query({
  args: {
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    let matters;
    
    if (args.clientId) {
      const clientId = args.clientId;
      matters = await ctx.db
        .query("matters")
        .withIndex("by_client", (q) => q.eq("clientId", clientId))
        .order("desc")
        .collect();
      // Filter by user as well
      matters = matters.filter((m) => m.userId === userId);
    } else if (args.status) {
      matters = await ctx.db
        .query("matters")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      matters = await ctx.db
        .query("matters")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }
    
    // Filter by priority if specified
    if (args.priority) {
      matters = matters.filter((m) => m.priority === args.priority);
    }
    
    return matters;
  },
});

// Get a single matter by ID
export const get = query({
  args: { id: v.id("matters") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const matter = await ctx.db.get(args.id);
    if (!matter || matter.userId !== userId) return null;
    
    return matter;
  },
});

// Get matter with client info
export const getWithClient = query({
  args: { id: v.id("matters") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const matter = await ctx.db.get(args.id);
    if (!matter || matter.userId !== userId) return null;
    
    const client = await ctx.db.get(matter.clientId);
    
    return {
      ...matter,
      client,
    };
  },
});

// Get recent matters
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    const limit = args.limit ?? 5;
    
    return await ctx.db
      .query("matters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

// Get matter statistics
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return { total: 0, open: 0, inProgress: 0, pendingReview: 0, closed: 0 };
    }
    
    const matters = await ctx.db
      .query("matters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return {
      total: matters.length,
      open: matters.filter((m) => m.status === "open").length,
      inProgress: matters.filter((m) => m.status === "in-progress").length,
      pendingReview: matters.filter((m) => m.status === "pending-review").length,
      closed: matters.filter((m) => m.status === "closed").length,
    };
  },
});

// Create a new matter
export const create = mutation({
  args: {
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    matterType: v.string(),
    status: v.string(),
    priority: v.string(),
    openDate: v.number(),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Verify client belongs to user
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== userId) {
      throw new Error("Client not found");
    }
    
    const now = Date.now();
    return await ctx.db.insert("matters", {
      userId,
      clientId: args.clientId,
      title: args.title,
      description: args.description,
      matterType: args.matterType,
      status: args.status,
      priority: args.priority,
      openDate: args.openDate,
      dueDate: args.dueDate,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a matter
export const update = mutation({
  args: {
    id: v.id("matters"),
    clientId: v.optional(v.id("clients")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    matterType: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    openDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const matter = await ctx.db.get(args.id);
    if (!matter || matter.userId !== userId) {
      throw new Error("Matter not found");
    }
    
    // If changing client, verify new client belongs to user
    if (args.clientId) {
      const client = await ctx.db.get(args.clientId);
      if (!client || client.userId !== userId) {
        throw new Error("Client not found");
      }
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

// Delete a matter
export const remove = mutation({
  args: { id: v.id("matters") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const matter = await ctx.db.get(args.id);
    if (!matter || matter.userId !== userId) {
      throw new Error("Matter not found");
    }
    
    await ctx.db.delete(args.id);
  },
});

// Search matters by title or description
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    const matters = await ctx.db
      .query("matters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const term = args.searchTerm.toLowerCase();
    return matters.filter(
      (matter) =>
        matter.title.toLowerCase().includes(term) ||
        matter.description?.toLowerCase().includes(term)
    );
  },
});
