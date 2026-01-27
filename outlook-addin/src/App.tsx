import React, { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { ConvexClientProvider } from "./lib/convex";
import { AuthLogin } from "./components/AuthLogin";
import { CreateMatterForm } from "./components/CreateMatterForm";

function AppContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    const runId = "pre-fix";
    const icon64Url = "https://localhost:3001/assets/icon-64.png";
    const icon128Url = "https://localhost:3001/assets/icon-128.png";

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId,
        hypothesisId: "H1",
        location: "App.tsx:15",
        message: "Taskpane runtime context",
        data: {
          href: window.location.href,
          origin: window.location.origin,
          isSecureContext: window.isSecureContext,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    const probe = (url: string, hypothesisId: string) => {
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId,
          hypothesisId,
          location: "App.tsx:32",
          message: "Icon fetch start",
          data: { url },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      fetch(url, { cache: "no-store" })
        .then((response) => {
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId,
              hypothesisId,
              location: "App.tsx:49",
              message: "Icon fetch response",
              data: {
                url,
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                redirected: response.redirected,
                type: response.type,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion agent log
        })
        .catch((error: Error) => {
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/eaeb51b8-92ad-488d-a31b-c9c2d792a076", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId,
              hypothesisId,
              location: "App.tsx:70",
              message: "Icon fetch error",
              data: { url, name: error.name, message: error.message },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion agent log
        });
    };

    probe(icon64Url, "H2");
    probe(icon128Url, "H3");
  }, []);

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
