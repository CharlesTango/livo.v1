import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Livo - Legal Matter Management",
  description: "Manage legal matters and clients with AI assistance",
};

function SetupInstructions() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-neutral flex items-center justify-center p-8">
          <div className="bg-white rounded-card shadow-soft p-8 max-w-lg text-center border border-secondary/30">
            <div className="w-16 h-16 bg-primary rounded-card flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-serif font-bold text-3xl">L</span>
            </div>
            <h1 className="text-2xl font-bold text-primary mb-4 font-serif">Setup Required</h1>
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
                <span>Follow the prompts to create a new Convex project</span>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">3</span>
                <span>Convex will automatically create your <code className="bg-secondary/50 px-2 py-0.5 rounded">.env.local</code> file</span>
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
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if Convex URL is configured
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <SetupInstructions />;
  }

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
