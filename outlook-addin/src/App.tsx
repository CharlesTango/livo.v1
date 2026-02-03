import React, { useState } from "react";
import { useConvexAuth } from "convex/react";
import { ConvexClientProvider } from "./lib/convex";
import { EmailProvider, useEmail } from "./lib/EmailContext";
import { AuthLogin } from "./components/AuthLogin";
import { CreateMatterForm } from "./components/CreateMatterForm";
import { AddToMatterForm } from "./components/AddToMatterForm";
import { MainMenu } from "./components/MainMenu";

type ViewType = "menu" | "create-matter" | "add-to-matter";

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { currentEmail, hasEmail, isLoading: emailLoading } = useEmail();
  const [currentView, setCurrentView] = useState<ViewType>("menu");

  // Loading state (auth or email context)
  if (authLoading || emailLoading) {
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

  // Authenticated - render based on current view
  const handleBackToMenu = () => setCurrentView("menu");

  if (currentView === "create-matter") {
    return <CreateMatterForm onBack={handleBackToMenu} />;
  }

  if (currentView === "add-to-matter") {
    return <AddToMatterForm onBack={handleBackToMenu} currentEmail={currentEmail} />;
  }

  // Default: show main menu
  return <MainMenu onSelectView={setCurrentView} hasEmail={hasEmail} currentEmail={currentEmail} />;
}

export function App() {
  return (
    <ConvexClientProvider>
      <EmailProvider>
        <AppContent />
      </EmailProvider>
    </ConvexClientProvider>
  );
}
