import React, { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

// The Convex URL should be set in the environment or use the production URL
// For development, this should match the same Convex deployment as the main app
const getConvexUrl = (): string => {
  // Check for environment variable first (set during build)
  if (typeof process !== "undefined" && process.env?.CONVEX_URL) {
    return process.env.CONVEX_URL;
  }
  
  // Default to the production Convex URL
  return "https://healthy-duck-95.convex.cloud";
};

const CONVEX_URL = getConvexUrl();

// Create a single Convex client instance
const convexClient = new ConvexReactClient(CONVEX_URL);

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexAuthProvider client={convexClient}>
      {children}
    </ConvexAuthProvider>
  );
}

export { convexClient, CONVEX_URL };
