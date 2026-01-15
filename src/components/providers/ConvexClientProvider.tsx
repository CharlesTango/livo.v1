"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center p-8">
        <div className="card max-w-lg text-center">
          <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-serif font-bold text-3xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4">Setup Required</h1>
          <p className="text-primary/60 mb-6">
            Livo requires a Convex backend to function. Please follow these steps:
          </p>
          <ol className="text-left text-sm text-primary/70 space-y-3 mb-6">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">1</span>
              <span>Run <code className="bg-secondary/50 px-2 py-0.5 rounded">npx convex dev</code> in your terminal</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">2</span>
              <span>Copy the Convex URL from the output</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">3</span>
              <span>Create <code className="bg-secondary/50 px-2 py-0.5 rounded">.env.local</code> with:<br />
                <code className="bg-secondary/50 px-2 py-0.5 rounded text-xs">NEXT_PUBLIC_CONVEX_URL=your-url</code>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">4</span>
              <span>Restart the Next.js dev server</span>
            </li>
          </ol>
          <p className="text-xs text-primary/50">
            See README.md for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  const convex = new ConvexReactClient(convexUrl);

  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
