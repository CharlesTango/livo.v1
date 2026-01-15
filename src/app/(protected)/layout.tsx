"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center animate-pulse">
            <span className="text-white font-serif font-bold text-xl">L</span>
          </div>
          <p className="text-primary/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}
