import React from "react";
import { useConvexAuth } from "convex/react";
import { ConvexClientProvider } from "./lib/convex";
import { AuthLogin } from "./components/AuthLogin";
import { CreateMatterForm } from "./components/CreateMatterForm";

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="loading-logo">L</div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return <AuthLogin />;
  }

  // Authenticated - show matter creation form
  return <CreateMatterForm />;
}

export function App() {
  return (
    <ConvexClientProvider>
      <AppContent />
    </ConvexClientProvider>
  );
}
