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
      <div className="min-h-screen flex items-center justify-center bg-neutral">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-secondary rounded-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center relative overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, #AAF0D1 0, #AAF0D1 1px, transparent 0, transparent 50%)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        <div className="relative text-center px-12">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">
            Start Managing Smarter
          </h2>
          <p className="text-white/70 text-lg">
            Join legal professionals who use Livo to streamline their practice.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-card flex items-center justify-center">
              <span className="text-white font-serif font-bold text-xl">L</span>
            </div>
            <span className="text-2xl font-serif font-bold text-primary">Livo</span>
          </Link>

          {/* Form Card */}
          <div className="card">
            <h1 className="text-2xl font-bold text-primary mb-2">Create your account</h1>
            <p className="text-primary/60 mb-8">
              Get started with Livo in just a few steps.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Create a password (min 8 characters)"
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
                className="w-full"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-primary/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline"
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
