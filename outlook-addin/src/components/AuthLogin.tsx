import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

interface AuthLoginProps {
  onSuccess?: () => void;
}

export function AuthLogin({ onSuccess }: AuthLoginProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      onSuccess?.();
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Header */}
      <div className="auth-header">
        <div className="logo-container">
          <img 
            src="/assets/livo-logo-medium.png" 
            alt="Livo" 
            className="logo-image"
          />
        </div>
        <h1 className="auth-title">Sign in to Livo</h1>
        <p className="auth-subtitle">
          Sign in to create matters from Outlook
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email" className="label">Email Address</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary btn-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-loading">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" />
                <circle className="spinner-head" cx="12" cy="12" r="10" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account? Sign up at{" "}
        <a href="https://livo.app/signup" target="_blank" rel="noopener noreferrer" className="link">
          livo.app
        </a>
      </p>
    </div>
  );
}
