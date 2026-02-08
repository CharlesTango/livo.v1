import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  
  // Users profile extension
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // Microsoft OAuth tokens for OneDrive integration
  microsoftTokens: defineTable({
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    scope: v.string(),
    // User's chosen root folder for matter storage
    rootFolderId: v.optional(v.string()),
    rootFolderPath: v.optional(v.string()),
    rootFolderName: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Clients table
  clients: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    industry: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_name", ["userId", "name"]),

  // Matters (cases) table
  matters: defineTable({
    userId: v.id("users"),
    clientId: v.id("clients"),
    title: v.string(),
    description: v.optional(v.string()),
    matterType: v.string(), // contract, litigation, advisory, compliance, etc.
    status: v.string(), // open, in-progress, pending-review, closed
    priority: v.string(), // low, medium, high, urgent
    openDate: v.number(),
    dueDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    // OneDrive integration fields
    onedriveFolderId: v.optional(v.string()),
    onedriveFolderUrl: v.optional(v.string()),
    onedriveFolderName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_client", ["clientId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_priority", ["userId", "priority"]),

  // Playbooks table
  playbooks: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    agreementType: v.string(), // e.g., "NDA", "MSA", "Employment"
    fileId: v.id("_storage"), // Original uploaded file
    fileName: v.string(),
    fileType: v.string(), // "docx" or "pdf"
    status: v.string(), // "processing", "ready", "error"
    errorMessage: v.optional(v.string()), // Error details if processing fails
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  // Clauses table (child of playbooks)
  clauses: defineTable({
    playbookId: v.id("playbooks"),
    userId: v.id("users"),
    order: v.number(), // Position in the agreement
    title: v.string(), // Clause title/header
    originalText: v.string(), // Original clause text from document
    // Summary section (editable)
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    talkingPoints: v.optional(v.array(v.string())),
    // Fallback positions (editable)
    fallbackPositions: v.optional(v.array(v.object({
      position: v.string(),
      rationale: v.optional(v.string()),
    }))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_playbook", ["playbookId"])
    .index("by_user", ["userId"]),
});
