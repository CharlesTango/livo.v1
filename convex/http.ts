import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Microsoft OAuth callback handler
http.route({
  path: "/api/auth/microsoft/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Get the frontend URL for redirects
    const convexSiteUrl = process.env.CONVEX_SITE_URL || url.origin;
    // Determine frontend URL (strip /api path if present, use origin)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendUrl}/profile?onedrive_error=${encodeURIComponent(errorDescription || error)}`,
        },
      });
    }

    if (!code || !state) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendUrl}/profile?onedrive_error=missing_code`,
        },
      });
    }

    // Parse state to get userId
    let userId: string;
    try {
      const stateData = JSON.parse(atob(state));
      userId = stateData.userId;
    } catch {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendUrl}/profile?onedrive_error=invalid_state`,
        },
      });
    }

    // Exchange code for tokens
    try {
      const redirectUri = `${convexSiteUrl}/api/auth/microsoft/callback`;
      
      const tokens = await ctx.runAction(internal.microsoft.exchangeCodeForTokens, {
        code,
        redirectUri,
      });

      // Store tokens in database
      await ctx.runMutation(internal.microsoft.storeTokensInternal, {
        userId: userId as any,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: Date.now() + tokens.expiresIn * 1000,
        scope: tokens.scope,
      });

      // Redirect back to profile with success
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendUrl}/profile?onedrive_connected=true`,
        },
      });
    } catch (err) {
      console.error("Failed to exchange code for tokens:", err);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendUrl}/profile?onedrive_error=token_exchange_failed`,
        },
      });
    }
  }),
});

export default http;
