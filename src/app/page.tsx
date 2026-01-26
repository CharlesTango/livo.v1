"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (isAuthenticated) {
      redirect("/dashboard");
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-m mb-4"></div>
          <div className="h-4 w-32 bg-neutral-medium/20 rounded-pill"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #B6D7C4 0, #B6D7C4 1px, transparent 1px, transparent 20px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-20">
          {/* Header */}
          <nav className="flex items-center justify-between mb-24">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-m flex items-center justify-center shadow-subtle">
                <span className="text-secondary font-heading font-extrabold text-2xl">L</span>
              </div>
              <span className="text-3xl font-heading font-extrabold text-secondary tracking-tight">Livo</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login">
                <Button variant="ghost" size="md" className="px-8">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="md" className="px-8">Get Started</Button>
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-heading font-extrabold text-secondary mb-8 leading-tight tracking-tighter">
              Legal Practice{" "}
              <span className="text-primary">Management</span>,{" "}
              <span className="relative">
                Simplified
                <span className="absolute bottom-2 left-0 w-full h-4 bg-primary-yellow/30 -z-10 rounded-pill" />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary/60 mb-12 leading-relaxed font-body font-medium max-w-3xl mx-auto">
              Streamline your legal workflow with intelligent matter tracking, 
              client management, and AI-powered assistance. Built for modern legal teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/signup">
                <Button variant="accent" size="lg" className="px-12 py-5 text-xl">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg" className="px-12 py-5 text-xl">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-32 grid md:grid-cols-3 gap-8">
            <Card className="text-center p-10 group">
              <div className="w-16 h-16 bg-primary rounded-m flex items-center justify-center mx-auto mb-6 shadow-subtle group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-extrabold text-secondary mb-4">Matter Tracking</h3>
              <p className="text-secondary/60 font-body font-medium leading-relaxed">
                Organize and track all your legal matters in one place with status updates and deadlines.
              </p>
            </Card>
            <Card className="text-center p-10 group">
              <div className="w-16 h-16 bg-primary-yellow rounded-m flex items-center justify-center mx-auto mb-6 shadow-subtle group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-extrabold text-secondary mb-4">Client Portal</h3>
              <p className="text-secondary/60 font-body font-medium leading-relaxed">
                Keep all client information organized and easily accessible for your entire team.
              </p>
            </Card>
            <Card className="text-center p-10 group">
              <div className="w-16 h-16 bg-secondary rounded-m flex items-center justify-center mx-auto mb-6 shadow-subtle group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-extrabold text-secondary mb-4">AI Intelligence</h3>
              <p className="text-secondary/60 font-body font-medium leading-relaxed">
                Let AI help populate client details and matter information to save you time.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-light/50 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-secondary/40 font-body font-bold text-sm uppercase tracking-widest">
          <div>© 2026 Livo. Modern Legal Management.</div>
          <div className="flex items-center gap-8">
            <Link href="/design-system" className="hover:text-secondary transition-colors">
              Design System
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
