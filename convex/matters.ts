import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

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
    
    const matters = await ctx.db
      .query("matters")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    // Fetch client info for each matter
    const mattersWithClients = await Promise.all(
      matters.map(async (matter) => {
        const client = await ctx.db.get(matter.clientId);
        return {
          ...matter,
          client,
        };
      })
    );
    
    return mattersWithClients;
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

// Internal mutation to create a matter (used by actions)
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
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
  handler: async (ctx, args): Promise<{ matterId: Id<"matters">; clientName: string }> => {
    // Verify client belongs to user
    const client = await ctx.db.get(args.clientId);
    if (!client || client.userId !== args.userId) {
      throw new Error("Client not found");
    }
    
    const now = Date.now();
    const matterId = await ctx.db.insert("matters", {
      userId: args.userId,
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
    
    return { matterId, clientName: client.name };
  },
});

// Create a new matter (simple mutation for when OneDrive isn't needed)
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

// Action to create a matter with OneDrive folder
export const createWithOneDrive = action({
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
  handler: async (ctx, args): Promise<Id<"matters">> => {
    // Get user ID from auth
    const userId = await ctx.runQuery(internal.users.getUserIdInternal, {});
    if (!userId) throw new Error("Not authenticated");
    
    // First create the matter
    const result = await ctx.runMutation(internal.matters.createInternal, {
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
    });
    
    // Try to create OneDrive folder (don't fail if this doesn't work)
    try {
      const folder = await ctx.runAction(internal.microsoft.createMatterFolder, {
        userId,
        clientName: result.clientName,
        matterTitle: args.title,
      });
      
      if (folder) {
        // Update the matter with folder info
        await ctx.runMutation(internal.microsoft.updateMatterWithFolder, {
          matterId: result.matterId,
          folderId: folder.folderId,
          folderUrl: folder.folderUrl,
          folderName: folder.folderName,
        });
      }
    } catch (error) {
      console.error("Failed to create OneDrive folder:", error);
      // Don't throw - matter was still created successfully
    }
    
    return result.matterId;
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

// Internal mutation to create a new client and matter together
export const createWithNewClientInternal = internalMutation({
  args: {
    userId: v.id("users"),
    clientName: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    matterType: v.string(),
    status: v.string(),
    priority: v.string(),
    openDate: v.number(),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ matterId: Id<"matters">; clientId: Id<"clients">; clientName: string }> => {
    const now = Date.now();
    
    // First, create the new client
    const clientId = await ctx.db.insert("clients", {
      userId: args.userId,
      name: args.clientName,
      createdAt: now,
      updatedAt: now,
    });
    
    // Then, create the matter with the new client
    const matterId = await ctx.db.insert("matters", {
      userId: args.userId,
      clientId,
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
    
    return { matterId, clientId, clientName: args.clientName };
  },
});

// Create a new matter with a new client (when client doesn't exist)
export const createWithNewClient = mutation({
  args: {
    clientName: v.string(),
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
    
    const now = Date.now();
    
    // First, create the new client
    const clientId = await ctx.db.insert("clients", {
      userId,
      name: args.clientName,
      createdAt: now,
      updatedAt: now,
    });
    
    // Then, create the matter with the new client
    const matterId = await ctx.db.insert("matters", {
      userId,
      clientId,
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
    
    return { matterId, clientId };
  },
});

// Action to create a matter with a new client and OneDrive folder
export const createWithNewClientAndOneDrive = action({
  args: {
    clientName: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    matterType: v.string(),
    status: v.string(),
    priority: v.string(),
    openDate: v.number(),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ matterId: Id<"matters">; clientId: Id<"clients"> }> => {
    // Get user ID from auth
    const userId = await ctx.runQuery(internal.users.getUserIdInternal, {});
    if (!userId) throw new Error("Not authenticated");
    
    // First create the client and matter
    const result = await ctx.runMutation(internal.matters.createWithNewClientInternal, {
      userId,
      clientName: args.clientName,
      title: args.title,
      description: args.description,
      matterType: args.matterType,
      status: args.status,
      priority: args.priority,
      openDate: args.openDate,
      dueDate: args.dueDate,
      notes: args.notes,
    });
    
    // Try to create OneDrive folder (don't fail if this doesn't work)
    try {
      const folder = await ctx.runAction(internal.microsoft.createMatterFolder, {
        userId,
        clientName: result.clientName,
        matterTitle: args.title,
      });
      
      if (folder) {
        // Update the matter with folder info
        await ctx.runMutation(internal.microsoft.updateMatterWithFolder, {
          matterId: result.matterId,
          folderId: folder.folderId,
          folderUrl: folder.folderUrl,
          folderName: folder.folderName,
        });
      }
    } catch (error) {
      console.error("Failed to create OneDrive folder:", error);
      // Don't throw - matter was still created successfully
    }
    
    return { matterId: result.matterId, clientId: result.clientId };
  },
});
