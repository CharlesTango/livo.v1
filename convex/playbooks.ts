import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Get all playbooks for the current user
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    let playbooks;

    if (args.status) {
      playbooks = await ctx.db
        .query("playbooks")
        .withIndex("by_user_and_status", (q) =>
          q.eq("userId", userId).eq("status", args.status!)
        )
        .order("desc")
        .collect();
    } else {
      playbooks = await ctx.db
        .query("playbooks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }

    // Get clause counts for each playbook
    const playbooksWithCounts = await Promise.all(
      playbooks.map(async (playbook) => {
        const clauses = await ctx.db
          .query("clauses")
          .withIndex("by_playbook", (q) => q.eq("playbookId", playbook._id))
          .collect();
        return {
          ...playbook,
          clauseCount: clauses.length,
        };
      })
    );

    return playbooksWithCounts;
  },
});

// Get a single playbook by ID
export const get = query({
  args: { id: v.id("playbooks") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const playbook = await ctx.db.get(args.id);
    if (!playbook || playbook.userId !== userId) return null;

    // Get clause count
    const clauses = await ctx.db
      .query("clauses")
      .withIndex("by_playbook", (q) => q.eq("playbookId", playbook._id))
      .collect();

    return {
      ...playbook,
      clauseCount: clauses.length,
    };
  },
});

// Get playbook with file URL
export const getWithFileUrl = query({
  args: { id: v.id("playbooks") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const playbook = await ctx.db.get(args.id);
    if (!playbook || playbook.userId !== userId) return null;

    // Get file URL
    const fileUrl = await ctx.storage.getUrl(playbook.fileId);

    // Get clause count
    const clauses = await ctx.db
      .query("clauses")
      .withIndex("by_playbook", (q) => q.eq("playbookId", playbook._id))
      .collect();

    return {
      ...playbook,
      fileUrl,
      clauseCount: clauses.length,
    };
  },
});

// Generate upload URL for file storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new playbook after file upload
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    agreementType: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const playbookId = await ctx.db.insert("playbooks", {
      userId,
      name: args.name,
      description: args.description,
      agreementType: args.agreementType,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      status: "processing",
      createdAt: now,
      updatedAt: now,
    });

    return playbookId;
  },
});

// Internal mutation to create playbook (for actions)
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    agreementType: v.string(),
    fileId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("playbooks", {
      userId: args.userId,
      name: args.name,
      description: args.description,
      agreementType: args.agreementType,
      fileId: args.fileId,
      fileName: args.fileName,
      fileType: args.fileType,
      status: "processing",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update playbook metadata
export const update = mutation({
  args: {
    id: v.id("playbooks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    agreementType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const playbook = await ctx.db.get(args.id);
    if (!playbook || playbook.userId !== userId) {
      throw new Error("Playbook not found");
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

// Update playbook status (internal)
export const updateStatus = internalMutation({
  args: {
    id: v.id("playbooks"),
    status: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      errorMessage: args.errorMessage,
      updatedAt: Date.now(),
    });
  },
});

// Delete a playbook and its clauses
export const remove = mutation({
  args: { id: v.id("playbooks") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const playbook = await ctx.db.get(args.id);
    if (!playbook || playbook.userId !== userId) {
      throw new Error("Playbook not found");
    }

    // Delete all associated clauses
    const clauses = await ctx.db
      .query("clauses")
      .withIndex("by_playbook", (q) => q.eq("playbookId", args.id))
      .collect();

    for (const clause of clauses) {
      await ctx.db.delete(clause._id);
    }

    // Delete the file from storage
    await ctx.storage.delete(playbook.fileId);

    // Delete the playbook
    await ctx.db.delete(args.id);
  },
});

// Search playbooks by name
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const playbooks = await ctx.db
      .query("playbooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const term = args.searchTerm.toLowerCase();
    const filtered = playbooks.filter(
      (playbook) =>
        playbook.name.toLowerCase().includes(term) ||
        playbook.description?.toLowerCase().includes(term) ||
        playbook.agreementType.toLowerCase().includes(term)
    );

    // Get clause counts
    const playbooksWithCounts = await Promise.all(
      filtered.map(async (playbook) => {
        const clauses = await ctx.db
          .query("clauses")
          .withIndex("by_playbook", (q) => q.eq("playbookId", playbook._id))
          .collect();
        return {
          ...playbook,
          clauseCount: clauses.length,
        };
      })
    );

    return playbooksWithCounts;
  },
});

// Get playbook statistics
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return { total: 0, ready: 0, processing: 0, error: 0 };
    }

    const playbooks = await ctx.db
      .query("playbooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      total: playbooks.length,
      ready: playbooks.filter((p) => p.status === "ready").length,
      processing: playbooks.filter((p) => p.status === "processing").length,
      error: playbooks.filter((p) => p.status === "error").length,
    };
  },
});

// Internal query to get playbook for processing
export const getForProcessing = internalQuery({
  args: { id: v.id("playbooks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get file URL for processing (internal)
export const getFileUrl = internalQuery({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});
