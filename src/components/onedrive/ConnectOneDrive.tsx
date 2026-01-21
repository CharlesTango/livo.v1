"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { useState, useEffect } from "react";
import { FolderPicker } from "./FolderPicker";

// Microsoft OAuth configuration
const MICROSOFT_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const SCOPES = ["Files.ReadWrite", "offline_access", "openid", "profile"];

interface ConnectOneDriveProps {
  compact?: boolean;
}

export function ConnectOneDrive({ compact = false }: ConnectOneDriveProps) {
  const connectionStatus = useQuery(api.microsoft.getConnectionStatus);
  const disconnect = useMutation(api.microsoft.disconnect);
  const setRootFolder = useMutation(api.microsoft.setRootFolder);
  const user = useQuery(api.users.current);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isSavingFolder, setIsSavingFolder] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check for OAuth callback result in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("onedrive_connected");
    const error = params.get("onedrive_error");

    if (connected === "true") {
      setMessage({ type: "success", text: "OneDrive connected successfully!" });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Clear message after delay
      setTimeout(() => setMessage(null), 5000);
    } else if (error) {
      let errorMessage = "Failed to connect OneDrive";
      if (error === "missing_code") {
        errorMessage = "Authorization was cancelled";
      } else if (error === "invalid_state") {
        errorMessage = "Invalid session state. Please try again.";
      } else if (error === "token_exchange_failed") {
        errorMessage = "Failed to complete authorization. Please try again.";
      } else {
        errorMessage = decodeURIComponent(error);
      }
      setMessage({ type: "error", text: errorMessage });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Clear message after delay
      setTimeout(() => setMessage(null), 8000);
    }
  }, []);

  const handleConnect = () => {
    if (!user) return;

    setIsConnecting(true);

    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

    if (!clientId || !convexSiteUrl) {
      setMessage({ type: "error", text: "OneDrive integration is not configured" });
      setIsConnecting(false);
      return;
    }

    const redirectUri = `${convexSiteUrl}/api/auth/microsoft/callback`;
    
    // Create state with user ID for the callback
    const state = btoa(JSON.stringify({ userId: user._id }));

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES.join(" "),
      state: state,
      response_mode: "query",
    });

    // Redirect to Microsoft OAuth
    window.location.href = `${MICROSOFT_AUTH_URL}?${params.toString()}`;
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnect();
      setMessage({ type: "success", text: "OneDrive disconnected successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to disconnect OneDrive" });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleFolderSelect = async (folder: { id: string; path: string; name: string }) => {
    setIsSavingFolder(true);
    try {
      await setRootFolder({
        folderId: folder.id,
        folderPath: folder.path,
        folderName: folder.name,
      });
      setMessage({ type: "success", text: `Folder set to "${folder.path}"` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save folder selection" });
    } finally {
      setIsSavingFolder(false);
      setShowFolderPicker(false);
    }
  };

  if (connectionStatus === undefined) {
    return (
      <div className="animate-pulse flex items-center gap-3">
        <div className="w-10 h-10 bg-neutral-light rounded-m"></div>
        <div className="h-4 bg-neutral-light rounded w-32"></div>
      </div>
    );
  }

  // Compact mode for use in modals
  if (compact) {
    if (connectionStatus.connected && connectionStatus.rootFolderId) {
      return (
        <div className="flex items-center gap-2 text-sm text-accent-success">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">OneDrive connected - folders will be created in {connectionStatus.rootFolderPath}</span>
        </div>
      );
    }
    if (connectionStatus.connected && !connectionStatus.rootFolderId) {
      return (
        <div className="flex items-center gap-2 text-sm text-accent-warning">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">OneDrive connected - please select a folder in your profile</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-sm text-secondary/60">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Connect OneDrive in your profile to auto-create folders</span>
      </div>
    );
  }

  // Full mode for profile page
  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-m font-medium ${
            message.type === "success"
              ? "bg-accent-success/10 text-accent-success"
              : "bg-accent-error/10 text-accent-error"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-neutral-light/30 rounded-m">
        <div className="flex items-center gap-4">
          {/* OneDrive Icon */}
          <div className="w-12 h-12 bg-[#0078D4] rounded-m flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.31 9.58c.25-.05.51-.08.78-.08 1.81 0 3.34 1.2 3.83 2.85.33-.1.68-.15 1.04-.15 1.89 0 3.43 1.54 3.43 3.43 0 1.89-1.54 3.43-3.43 3.43H6.52c-2.21 0-4-1.79-4-4 0-1.87 1.29-3.44 3.02-3.87.17-2.23 2.02-4 4.28-4 1.44 0 2.72.72 3.49 1.82.31-.27.68-.47 1.09-.59z"/>
            </svg>
          </div>
          <div>
            <h4 className="font-heading font-bold text-secondary">Microsoft OneDrive</h4>
            {connectionStatus.connected ? (
              <p className="text-sm text-accent-success font-medium">Connected</p>
            ) : (
              <p className="text-sm text-secondary/60">Connect to auto-create matter folders</p>
            )}
          </div>
        </div>

        {connectionStatus.connected ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            isLoading={isDisconnecting}
            className="text-accent-error hover:bg-accent-error/10"
          >
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            isLoading={isConnecting}
            disabled={!user}
          >
            Connect OneDrive
          </Button>
        )}
      </div>

      {connectionStatus.connected && (
        <>
          {/* Root Folder Selection */}
          <div className="border border-neutral-light rounded-m p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-secondary">Matter Storage Location</h5>
                <p className="text-sm text-secondary/60">
                  Choose where client folders will be created
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFolderPicker(true)}
                isLoading={isSavingFolder}
              >
                {connectionStatus.rootFolderId ? "Change" : "Choose Folder"}
              </Button>
            </div>
            
            {connectionStatus.rootFolderId ? (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-m">
                <div className="w-10 h-10 bg-primary/20 rounded-m flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-secondary truncate">{connectionStatus.rootFolderName || "Selected Folder"}</p>
                  <p className="text-xs text-secondary/50 truncate">{connectionStatus.rootFolderPath}</p>
                </div>
                <svg className="w-5 h-5 text-accent-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-accent-warning/10 border border-accent-warning/20 rounded-m">
                <svg className="w-5 h-5 text-accent-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-secondary/70">
                  Please select a folder to enable automatic matter folder creation
                </p>
              </div>
            )}
          </div>

          {/* Folder structure explanation */}
          <div className="text-sm text-secondary/60 space-y-1">
            <p className="font-medium text-secondary/80">Folder Structure:</p>
            <div className="font-mono text-xs bg-neutral-light/50 p-3 rounded-m">
              <p>{connectionStatus.rootFolderPath || "[Selected Folder]"}/</p>
              <p className="pl-4">└── [Client Name]/</p>
              <p className="pl-8">└── [Matter Title]/</p>
            </div>
          </div>
        </>
      )}

      {/* Folder Picker Modal */}
      <FolderPicker
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        onSelect={handleFolderSelect}
      />
    </div>
  );
}
