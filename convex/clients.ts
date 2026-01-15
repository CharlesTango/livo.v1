import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all clients for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a single client by ID
export const get = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) return null;
    
    return client;
  },
});

// Create a new client
export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const now = Date.now();
    return await ctx.db.insert("clients", {
      userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      company: args.company,
      address: args.address,
      industry: args.industry,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a client
export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) {
      throw new Error("Client not found");
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

// Delete a client
export const remove = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== userId) {
      throw new Error("Client not found");
    }
    
    // Also delete all matters associated with this client
    const matters = await ctx.db
      .query("matters")
      .withIndex("by_client", (q) => q.eq("clientId", args.id))
      .collect();
    
    for (const matter of matters) {
      await ctx.db.delete(matter._id);
    }
    
    await ctx.db.delete(args.id);
  },
});

// Search clients by name
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    const clients = await ctx.db
      .query("clients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const term = args.searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.company?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
    );
  },
});
