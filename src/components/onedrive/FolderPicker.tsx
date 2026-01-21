"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal, Button, Input } from "@/components/ui";
import { useState, useEffect } from "react";

interface Folder {
  id: string;
  name: string;
  path: string;
}

interface FolderPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (folder: { id: string; path: string; name: string }) => void;
}

export function FolderPicker({ isOpen, onClose, onSelect }: FolderPickerProps) {
  const browseFolders = useAction(api.microsoft.browseFolders);
  const createNewFolder = useAction(api.microsoft.createNewFolder);
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New folder creation
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Navigation history for back button
  const [history, setHistory] = useState<Array<{ id: string | undefined; path: string }>>([]);

  const loadFolders = async (folderId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await browseFolders({ folderId });
      
      if (result) {
        setFolders(result.folders);
        setCurrentPath(result.currentPath);
        setParentId(result.parentId);
        setCurrentFolderId(folderId);
      } else {
        setError("Failed to load folders");
      }
    } catch (err) {
      console.error("Error loading folders:", err);
      setError("Failed to load folders");
    } finally {
      setIsLoading(false);
    }
  };

  // Load root folders when modal opens
  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      loadFolders(undefined);
    }
  }, [isOpen]);

  const navigateToFolder = (folder: Folder) => {
    setHistory([...history, { id: currentFolderId, path: currentPath }]);
    loadFolders(folder.id);
  };

  const navigateBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setHistory(history.slice(0, -1));
      loadFolders(previous.id);
    }
  };

  const navigateToRoot = () => {
    setHistory([]);
    loadFolders(undefined);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsCreating(true);
    try {
      const result = await createNewFolder({
        parentFolderId: currentFolderId,
        folderName: newFolderName.trim(),
      });
      
      if (result) {
        // Refresh the current folder
        await loadFolders(currentFolderId);
        setNewFolderName("");
        setShowNewFolder(false);
      } else {
        setError("Failed to create folder");
      }
    } catch (err) {
      console.error("Error creating folder:", err);
      setError("Failed to create folder. It may already exist.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelect = () => {
    // Select current folder
    onSelect({
      id: currentFolderId || "root",
      path: currentPath,
      name: currentPath === "/" ? "OneDrive Root" : currentPath.split("/").pop() || "Root",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Folder for Matters" className="max-w-2xl">
      <div className="space-y-4">
        {/* Current path breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={navigateToRoot}
            className="text-primary hover:underline font-medium"
          >
            OneDrive
          </button>
          {currentPath !== "/" && (
            <>
              {currentPath.split("/").filter(Boolean).map((segment, index, arr) => (
                <span key={index} className="flex items-center gap-2">
                  <span className="text-secondary/40">/</span>
                  <span className={index === arr.length - 1 ? "font-medium text-secondary" : "text-secondary/60"}>
                    {segment}
                  </span>
                </span>
              ))}
            </>
          )}
        </div>

        {/* Current selection info */}
        <div className="bg-primary/10 border border-primary/20 rounded-m p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Selected folder:</p>
            <p className="text-secondary/70">{currentPath === "/" ? "OneDrive Root" : currentPath}</p>
          </div>
          <Button size="sm" onClick={handleSelect}>
            Use This Folder
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-accent-error/10 border border-accent-error/20 text-accent-error px-4 py-3 rounded-m text-sm">
            {error}
          </div>
        )}

        {/* Navigation and actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              disabled={history.length === 0 || isLoading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadFolders(currentFolderId)}
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewFolder(!showNewFolder)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Folder
          </Button>
        </div>

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex gap-2">
            <Input
              id="newFolderName"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              className="flex-1"
            />
            <Button onClick={handleCreateFolder} isLoading={isCreating} disabled={!newFolderName.trim()}>
              Create
            </Button>
            <Button variant="ghost" onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}>
              Cancel
            </Button>
          </div>
        )}

        {/* Folder list */}
        <div className="border border-neutral-light rounded-m max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-secondary/60 text-sm">Loading folders...</p>
            </div>
          ) : folders.length === 0 ? (
            <div className="p-8 text-center text-secondary/60">
              <svg className="w-12 h-12 mx-auto mb-3 text-secondary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p>No subfolders</p>
              <p className="text-sm mt-1">Create a new folder or select this location</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-light">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateToFolder(folder)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-neutral-light/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-m flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary truncate">{folder.name}</p>
                  </div>
                  <svg className="w-5 h-5 text-secondary/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
