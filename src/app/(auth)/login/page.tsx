"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      redirect("/dashboard");
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", "signIn");
      
      await signIn("password", formData);
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary rounded-m flex items-center justify-center shadow-subtle">
              <span className="text-secondary font-heading font-extrabold text-2xl">L</span>
            </div>
            <span className="text-3xl font-heading font-extrabold text-secondary tracking-tight">Livo</span>
          </Link>

          {/* Form Card */}
          <div className="card shadow-large p-10">
            <h1 className="text-3xl font-heading font-extrabold text-secondary mb-3">Welcome back</h1>
            <p className="text-secondary/60 mb-10 font-body font-medium leading-relaxed">
              Sign in to your account to continue.
            </p>

            {error && (
              <div className="bg-accent-error/10 border-2 border-accent-error/20 text-accent-error px-6 py-4 rounded-m mb-8 font-body font-bold text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full py-4 text-lg"
                isLoading={isSubmitting}
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-8 text-center text-secondary/60 font-body font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-secondary font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-secondary items-center justify-center relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #B6D7C4 0, #B6D7C4 10px, transparent 10px, transparent 20px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        <div className="relative text-center px-16 max-w-xl">
          <h2 className="text-5xl font-heading font-extrabold text-white mb-6 leading-tight">
            Manage Your Legal Practice
          </h2>
          <p className="text-white/70 text-xl font-body font-medium leading-relaxed">
            Track matters, manage clients, and streamline your workflow with AI assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
