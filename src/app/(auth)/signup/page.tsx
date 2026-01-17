"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, Input } from "@/components/ui";

export default function SignupPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn } = useAuthActions();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("name", name);
      formData.set("flow", "signUp");
      
      await signIn("password", formData);
    } catch (err) {
      setError("An error occurred. Please try again.");
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
      {/* Left Side - Decorative */}
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
            Start Managing Smarter
          </h2>
          <p className="text-white/70 text-xl font-body font-medium leading-relaxed">
            Join legal professionals who use Livo to streamline their practice.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
            <h1 className="text-3xl font-heading font-extrabold text-secondary mb-3">Create account</h1>
            <p className="text-secondary/60 mb-10 font-body font-medium leading-relaxed">
              Get started with Livo in just a few steps.
            </p>

            {error && (
              <div className="bg-accent-error/10 border-2 border-accent-error/20 text-accent-error px-6 py-4 rounded-m mb-8 font-body font-bold text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="name"
                type="text"
                label="Full Name"
                placeholder="John Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

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
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full py-4 text-lg"
                isLoading={isSubmitting}
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-8 text-center text-secondary/60 font-body font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-secondary font-bold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
