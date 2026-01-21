import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// Internal query to get user ID from auth (for use in actions)
export const getUserIdInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    return userId;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updates: { name?: string } = {};
    
    if (args.name !== undefined) {
      updates.name = args.name;
    }

    await ctx.db.patch(userId, updates);
    
    return await ctx.db.get(userId);
  },
});
