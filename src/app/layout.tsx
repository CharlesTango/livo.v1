import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Livo - Legal Matter Management",
  description: "Manage legal matters and clients with AI assistance",
};

function SetupInstructions() {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body className="font-body">
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="bg-white rounded-l shadow-subtle p-12 max-w-lg text-center">
            <div className="w-20 h-20 bg-primary rounded-m flex items-center justify-center mx-auto mb-8">
              <span className="text-secondary font-heading font-extrabold text-4xl">L</span>
            </div>
            <h1 className="text-3xl font-extrabold text-secondary mb-6 font-heading">Setup Required</h1>
            <p className="text-secondary/60 mb-8">
              Livo requires a Convex backend to function. Please follow these steps:
            </p>
            <ol className="text-left text-sm text-secondary/70 space-y-4 mb-8">
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-pill flex items-center justify-center text-secondary font-bold text-sm shrink-0">1</span>
                <span className="flex items-center">Run <code className="bg-neutral-light px-2 py-1 rounded-s mx-1 font-mono">npx convex dev</code> in your terminal</span>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-pill flex items-center justify-center text-secondary font-bold text-sm shrink-0">2</span>
                <span className="flex items-center">Follow the prompts to create a new Convex project</span>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-pill flex items-center justify-center text-secondary font-bold text-sm shrink-0">3</span>
                <span className="flex items-center">Convex will automatically create your <code className="bg-neutral-light px-2 py-1 rounded-s mx-1 font-mono">.env.local</code> file</span>
              </li>
              <li className="flex gap-4">
                <span className="w-8 h-8 bg-primary rounded-pill flex items-center justify-center text-secondary font-bold text-sm shrink-0">4</span>
                <span className="flex items-center">Restart the Next.js dev server</span>
              </li>
            </ol>
            <p className="text-xs text-secondary/40">
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
      <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
        <body className="font-body">
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
