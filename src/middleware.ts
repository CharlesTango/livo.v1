console.log("[Middleware] Module loading...");

import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

console.log("[Middleware] Imports successful");

const isPublicPage = createRouteMatcher(["/", "/login", "/signup"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    // Redirect authenticated users away from auth pages
    if (isPublicPage(request) && (await convexAuth.isAuthenticated())) {
      if (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") {
        return nextjsMiddlewareRedirect(request, "/dashboard");
      }
    }
    
    // Redirect unauthenticated users to login for protected routes
    if (!isPublicPage(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  },
  { verbose: true }
);

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
