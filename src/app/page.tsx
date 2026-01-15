"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isAuthenticated) {
      redirect("/dashboard");
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-secondary rounded-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #2B3856 0, #2B3856 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">L</span>
              </div>
              <span className="text-2xl font-serif font-bold text-primary">Livo</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="secondary" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6 leading-tight">
              Legal Practice Management,{" "}
              <span className="text-accent-700">Simplified</span>
            </h1>
            <p className="text-xl text-primary/70 mb-10 leading-relaxed">
              Streamline your legal workflow with intelligent matter tracking, 
              client management, and AI-powered assistance. Built for in-house 
              counsel and small legal teams.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="accent" size="lg">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-card flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Matter Tracking</h3>
              <p className="text-primary/60 text-sm">
                Organize and track all your legal matters in one place with status updates and deadlines.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-card flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Client Management</h3>
              <p className="text-primary/60 text-sm">
                Keep all client information organized and easily accessible for your entire team.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-14 h-14 bg-accent/20 rounded-card flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">AI Assistance</h3>
              <p className="text-primary/60 text-sm">
                Let AI help populate client details and matter information to save you time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-secondary/30 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-primary/50 text-sm">
          © 2026 Livo. Legal Practice Management.
        </div>
      </footer>
    </div>
  );
}
