import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// Microsoft OAuth configuration
const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_API_URL = "https://graph.microsoft.com/v1.0";

// Scopes needed for OneDrive access
const SCOPES = ["Files.ReadWrite", "offline_access", "openid", "profile"];

// Get the OAuth authorization URL for Microsoft
export const getAuthUrl = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    // We'll construct the URL on the frontend since we need env vars
    // This query just validates the user is authenticated
    return { authenticated: true };
  },
});

// Check if the current user has connected OneDrive
export const getConnectionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return { connected: false };

    const tokens = await ctx.db
      .query("microsoftTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return {
      connected: !!tokens,
      expiresAt: tokens?.expiresAt,
      rootFolderId: tokens?.rootFolderId,
      rootFolderPath: tokens?.rootFolderPath,
      rootFolderName: tokens?.rootFolderName,
    };
  },
});

// Internal query to get tokens for a user
export const getTokensInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("microsoftTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Internal mutation to store tokens
export const storeTokensInternal = internalMutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    scope: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if tokens already exist for this user
    const existing = await ctx.db
      .query("microsoftTokens")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scope: args.scope,
      });
    } else {
      await ctx.db.insert("microsoftTokens", {
        userId: args.userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        scope: args.scope,
      });
    }
  },
});

// Internal mutation to update access token after refresh
export const updateAccessTokenInternal = internalMutation({
  args: {
    tokenId: v.id("microsoftTokens"),
    accessToken: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tokenId, {
      accessToken: args.accessToken,
      expiresAt: args.expiresAt,
    });
  },
});

// Disconnect OneDrive (remove tokens)
export const disconnect = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tokens = await ctx.db
      .query("microsoftTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (tokens) {
      await ctx.db.delete(tokens._id);
    }

    return { success: true };
  },
});

// Save the user's chosen root folder
export const setRootFolder = mutation({
  args: {
    folderId: v.string(),
    folderPath: v.string(),
    folderName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const tokens = await ctx.db
      .query("microsoftTokens")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!tokens) {
      throw new Error("OneDrive not connected");
    }

    await ctx.db.patch(tokens._id, {
      rootFolderId: args.folderId,
      rootFolderPath: args.folderPath,
      rootFolderName: args.folderName,
    });

    return { success: true };
  },
});

// Helper function to get a valid access token (refreshes if needed)
async function getValidAccessToken(
  ctx: any,
  tokens: { _id: Id<"microsoftTokens">; accessToken: string; refreshToken: string; expiresAt: number }
): Promise<string | null> {
  let accessToken = tokens.accessToken;
  
  // Refresh if expires in less than 5 minutes
  if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
    try {
      const refreshed = await ctx.runAction(internal.microsoft.refreshAccessToken, {
        refreshToken: tokens.refreshToken,
      });
      accessToken = refreshed.accessToken;
      
      await ctx.runMutation(internal.microsoft.updateAccessTokenInternal, {
        tokenId: tokens._id,
        accessToken: refreshed.accessToken,
        expiresAt: Date.now() + refreshed.expiresIn * 1000,
      });
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }
  
  return accessToken;
}

// List folders in OneDrive (for folder picker)
export const listFolders = internalAction({
  args: {
    userId: v.id("users"),
    folderId: v.optional(v.string()), // null/undefined = root
  },
  handler: async (ctx, args): Promise<{ 
    folders: Array<{ id: string; name: string; path: string }>;
    currentPath: string;
    parentId: string | null;
  } | null> => {
    const tokens = await ctx.runQuery(internal.microsoft.getTokensInternal, {
      userId: args.userId,
    });

    if (!tokens) {
      return null;
    }

    const accessToken = await getValidAccessToken(ctx, tokens);
    if (!accessToken) return null;

    try {
      // Determine the endpoint based on whether we're at root or a subfolder
      const endpoint = args.folderId
        ? `${GRAPH_API_URL}/me/drive/items/${args.folderId}/children?$filter=folder ne null&$select=id,name,parentReference`
        : `${GRAPH_API_URL}/me/drive/root/children?$filter=folder ne null&$select=id,name,parentReference`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to list folders:", await response.text());
        return null;
      }

      const data = await response.json();
      
      // Get current folder info for path display
      let currentPath = "/";
      let parentId: string | null = null;
      
      if (args.folderId) {
        const folderResponse = await fetch(
          `${GRAPH_API_URL}/me/drive/items/${args.folderId}?$select=name,parentReference`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (folderResponse.ok) {
          const folderData = await folderResponse.json();
          currentPath = folderData.parentReference?.path 
            ? `${folderData.parentReference.path.replace("/drive/root:", "")}/${folderData.name}`
            : `/${folderData.name}`;
          parentId = folderData.parentReference?.id || null;
        }
      }

      const folders = data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        path: item.parentReference?.path 
          ? `${item.parentReference.path.replace("/drive/root:", "")}/${item.name}`
          : `/${item.name}`,
      }));

      return { folders, currentPath, parentId };
    } catch (error) {
      console.error("Error listing folders:", error);
      return null;
    }
  },
});

// Create a new folder in OneDrive (for folder picker)
export const createFolder = internalAction({
  args: {
    userId: v.id("users"),
    parentFolderId: v.optional(v.string()), // null = root
    folderName: v.string(),
  },
  handler: async (ctx, args): Promise<{ id: string; name: string; path: string } | null> => {
    const tokens = await ctx.runQuery(internal.microsoft.getTokensInternal, {
      userId: args.userId,
    });

    if (!tokens) {
      return null;
    }

    const accessToken = await getValidAccessToken(ctx, tokens);
    if (!accessToken) return null;

    try {
      const endpoint = args.parentFolderId
        ? `${GRAPH_API_URL}/me/drive/items/${args.parentFolderId}/children`
        : `${GRAPH_API_URL}/me/drive/root/children`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.folderName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "fail",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to create folder:", error);
        return null;
      }

      const folder = await response.json();
      
      return {
        id: folder.id,
        name: folder.name,
        path: folder.parentReference?.path 
          ? `${folder.parentReference.path.replace("/drive/root:", "")}/${folder.name}`
          : `/${folder.name}`,
      };
    } catch (error) {
      console.error("Error creating folder:", error);
      return null;
    }
  },
});

// Internal action to exchange auth code for tokens (called from callback handler)
export const exchangeCodeForTokens = internalAction({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Microsoft OAuth not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: args.code,
      redirect_uri: args.redirectUri,
      grant_type: "authorization_code",
      scope: SCOPES.join(" "),
    });

    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token exchange failed:", error);
      throw new Error("Failed to exchange code for tokens");
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  },
});

// Action to refresh an access token
export const refreshAccessToken = internalAction({
  args: {
    refreshToken: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Microsoft OAuth not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: args.refreshToken,
      grant_type: "refresh_token",
      scope: SCOPES.join(" "),
    });

    const response = await fetch(MICROSOFT_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token refresh failed:", error);
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || args.refreshToken,
      expiresIn: data.expires_in,
    };
  },
});

// Action to create a folder in OneDrive for a matter
// Structure: {Root Folder}/{Client Name}/{Matter Title}
export const createMatterFolder = internalAction({
  args: {
    userId: v.id("users"),
    clientName: v.string(),
    matterTitle: v.string(),
  },
  handler: async (ctx, args): Promise<{ folderId: string; folderUrl: string; folderName: string } | null> => {
    // Get user's tokens
    const tokens = await ctx.runQuery(internal.microsoft.getTokensInternal, {
      userId: args.userId,
    });

    if (!tokens) {
      console.log("User has not connected OneDrive");
      return null;
    }

    // Check if user has set a root folder
    if (!tokens.rootFolderId) {
      console.log("User has not configured a root folder for matters");
      return null;
    }

    const accessToken = await getValidAccessToken(ctx, tokens);
    if (!accessToken) return null;

    const rootFolderId = tokens.rootFolderId;

    // Step 1: Ensure the Client folder exists inside the root folder
    let clientFolderId: string | null = null;

    try {
      // Try to find existing client folder
      const searchResponse = await fetch(
        `${GRAPH_API_URL}/me/drive/items/${rootFolderId}/children?$filter=name eq '${encodeURIComponent(args.clientName).replace(/'/g, "''")}'`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const existingFolder = searchData.value?.find((item: any) => item.folder && item.name === args.clientName);
        
        if (existingFolder) {
          clientFolderId = existingFolder.id;
        }
      }

      // If client folder doesn't exist, create it
      if (!clientFolderId) {
        const createClientResponse = await fetch(
          `${GRAPH_API_URL}/me/drive/items/${rootFolderId}/children`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: args.clientName,
              folder: {},
              "@microsoft.graph.conflictBehavior": "fail",
            }),
          }
        );

        if (createClientResponse.ok) {
          const folder = await createClientResponse.json();
          clientFolderId = folder.id;
        } else if (createClientResponse.status === 409) {
          // Conflict - folder already exists, try to get it again
          const retrySearch = await fetch(
            `${GRAPH_API_URL}/me/drive/items/${rootFolderId}/children?$filter=name eq '${encodeURIComponent(args.clientName).replace(/'/g, "''")}'`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (retrySearch.ok) {
            const retryData = await retrySearch.json();
            const folder = retryData.value?.find((item: any) => item.folder);
            if (folder) clientFolderId = folder.id;
          }
        } else {
          console.error("Failed to create client folder:", await createClientResponse.text());
        }
      }
    } catch (error) {
      console.error("Error handling client folder:", error);
      return null;
    }

    if (!clientFolderId) {
      console.error("Could not get or create client folder");
      return null;
    }

    // Step 2: Create the matter folder inside the client folder
    try {
      const response = await fetch(
        `${GRAPH_API_URL}/me/drive/items/${clientFolderId}/children`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: args.matterTitle,
            folder: {},
            "@microsoft.graph.conflictBehavior": "rename",
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to create matter folder:", error);
        return null;
      }

      const folder = await response.json();

      return {
        folderId: folder.id,
        folderUrl: folder.webUrl,
        folderName: folder.name,
      };
    } catch (error) {
      console.error("Error creating matter folder:", error);
      return null;
    }
  },
});

// Internal mutation to update matter with OneDrive folder info
export const updateMatterWithFolder = internalMutation({
  args: {
    matterId: v.id("matters"),
    folderId: v.string(),
    folderUrl: v.string(),
    folderName: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matterId, {
      onedriveFolderId: args.folderId,
      onedriveFolderUrl: args.folderUrl,
      onedriveFolderName: args.folderName,
    });
  },
});

// Mutation to manually link an existing OneDrive folder to a matter
export const linkFolderToMatter = mutation({
  args: {
    matterId: v.id("matters"),
    folderUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const matter = await ctx.db.get(args.matterId);
    if (!matter || matter.userId !== userId) {
      throw new Error("Matter not found");
    }

    await ctx.db.patch(args.matterId, {
      onedriveFolderUrl: args.folderUrl,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Mutation to unlink OneDrive folder from a matter
export const unlinkFolderFromMatter = mutation({
  args: {
    matterId: v.id("matters"),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const matter = await ctx.db.get(args.matterId);
    if (!matter || matter.userId !== userId) {
      throw new Error("Matter not found");
    }

    await ctx.db.patch(args.matterId, {
      onedriveFolderId: undefined,
      onedriveFolderUrl: undefined,
      onedriveFolderName: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Type definitions for folder browsing
type FolderListResult = {
  folders: Array<{ id: string; name: string; path: string }>;
  currentPath: string;
  parentId: string | null;
} | null;

type FolderCreateResult = {
  id: string;
  name: string;
  path: string;
} | null;

// Public action to list folders (for folder picker UI)
export const browseFolders = action({
  args: {
    folderId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<FolderListResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = await ctx.runQuery(internal.users.getUserIdInternal, {});
    if (!userId) throw new Error("User not found");

    return await ctx.runAction(internal.microsoft.listFolders, {
      userId,
      folderId: args.folderId,
    });
  },
});

// Public action to create a folder (for folder picker UI)
export const createNewFolder = action({
  args: {
    parentFolderId: v.optional(v.string()),
    folderName: v.string(),
  },
  handler: async (ctx, args): Promise<FolderCreateResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = await ctx.runQuery(internal.users.getUserIdInternal, {});
    if (!userId) throw new Error("User not found");

    return await ctx.runAction(internal.microsoft.createFolder, {
      userId,
      parentFolderId: args.parentFolderId,
      folderName: args.folderName,
    });
  },
});
