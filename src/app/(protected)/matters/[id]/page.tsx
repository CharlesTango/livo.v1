"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Textarea, Select, Modal } from "@/components/ui";
import { formatDate, matterStatusColors, priorityColors } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";

const matterTypes = [
  { value: "contract", label: "Contract" },
  { value: "litigation", label: "Litigation" },
  { value: "advisory", label: "Advisory" },
  { value: "compliance", label: "Compliance" },
  { value: "corporate", label: "Corporate" },
  { value: "employment", label: "Employment" },
  { value: "intellectual-property", label: "Intellectual Property" },
  { value: "real-estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending-review", label: "Pending Review" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function MatterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matterId = params.id as Id<"matters">;
  
  const matterWithClient = useQuery(api.matters.getWithClient, { id: matterId });
  const clients = useQuery(api.clients.list);
  const connectionStatus = useQuery(api.microsoft.getConnectionStatus);
  const updateMatter = useMutation(api.matters.update);
  const deleteMatter = useMutation(api.matters.remove);
  const linkFolder = useMutation(api.microsoft.linkFolderToMatter);
  const unlinkFolder = useMutation(api.microsoft.unlinkFolderFromMatter);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [folderUrl, setFolderUrl] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  
  // Form state - initialized from matter data
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [matterType, setMatterType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const matter = matterWithClient;
  const client = matterWithClient?.client;

  // Initialize form state when matter loads
  useEffect(() => {
    if (matter && !isInitialized) {
      setStatus(matter.status);
      setPriority(matter.priority);
      setMatterType(matter.matterType);
      setDueDate(matter.dueDate ? new Date(matter.dueDate).toISOString().split("T")[0] : "");
      setNotes(matter.notes || "");
      setClientId(matter.clientId);
      setIsInitialized(true);
    }
  }, [matter, isInitialized]);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!matter || !isInitialized) return false;
    
    const originalDueDate = matter.dueDate ? new Date(matter.dueDate).toISOString().split("T")[0] : "";
    
    return (
      status !== matter.status ||
      priority !== matter.priority ||
      matterType !== matter.matterType ||
      dueDate !== originalDueDate ||
      notes !== (matter.notes || "") ||
      clientId !== matter.clientId
    );
  }, [matter, isInitialized, status, priority, matterType, dueDate, notes, clientId]);

  const saveChanges = async () => {
    if (!matter) return;
    
    setIsSaving(true);
    try {
      await updateMatter({
        id: matterId,
        clientId: clientId as Id<"clients">,
        title: matter.title,
        description: matter.description || undefined,
        matterType,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        notes: notes || undefined,
      });
    } catch (err) {
      console.error("Failed to update matter:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    if (matter) {
      setStatus(matter.status);
      setPriority(matter.priority);
      setMatterType(matter.matterType);
      setDueDate(matter.dueDate ? new Date(matter.dueDate).toISOString().split("T")[0] : "");
      setNotes(matter.notes || "");
      setClientId(matter.clientId);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this matter?")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteMatter({ id: matterId });
      router.push("/matters");
    } catch (err) {
      console.error("Failed to delete matter:", err);
      setIsDeleting(false);
    }
  };

  const clientOptions = [
    { value: "", label: "Select a client..." },
    ...(clients?.map((c) => ({ value: c._id, label: c.name + (c.company ? ` (${c.company})` : "") })) || []),
  ];

  if (matter === undefined) {
    return (
      <>
        <Header title="Loading..." />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="card">
              <div className="h-6 bg-secondary rounded w-1/3 mb-4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (matter === null) {
    return (
      <>
        <Header title="Matter Not Found" />
        <div className="flex-1 p-8 bg-background">
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <p className="text-xl font-heading font-bold text-secondary/60 mb-8">This matter could not be found.</p>
            <Button onClick={() => router.push("/matters")} size="lg">
              Back to Matters
            </Button>
          </div>
        </div>
      </>
    );
  }

  const selectedClient = clients?.find(c => c._id === clientId);

  return (
    <>
      <Header
        title={matter.title}
        description={matter.description || undefined}
        actions={
          <div className="flex gap-4">
            <Button
              variant="ghost"
              className="text-accent-error border-accent-error hover:bg-accent-error hover:text-white px-6"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Save Banner - appears when there are unsaved changes */}
        {hasChanges && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-secondary shadow-lg rounded-l px-6 py-4 flex items-center gap-6">
            <span className="text-white font-body font-medium">You have unsaved changes</span>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={discardChanges} className="text-white/70 hover:text-white hover:bg-white/10">
                Discard
              </Button>
              <Button size="sm" onClick={saveChanges} isLoading={isSaving} className="bg-primary text-secondary hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Matter Details Card - full width, concise grid */}
        <Card>
          <CardHeader className="mb-6">
            <CardTitle className="text-2xl font-heading font-extrabold text-secondary">Matter Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Client */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Client</p>
                <Select
                  id="client"
                  options={clientOptions}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="text-sm"
                />
                {selectedClient && (
                  <Link
                    href={`/clients/${selectedClient._id}`}
                    className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    View client
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Status</p>
                <Select
                  id="status"
                  options={statusOptions}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Priority</p>
                <Select
                  id="priority"
                  options={priorityOptions}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Timeline */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Due Date</p>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-secondary/50">
                  Opened: {formatDate(matter.openDate)}
                </p>
              </div>

              {/* Folder / Documents */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary/40 uppercase tracking-widest">Folder</p>
                {matter.onedriveFolderUrl ? (
                  // Connected OneDrive folder
                  <div className="space-y-2">
                    <a
                      href={matter.onedriveFolderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3 rounded-m bg-[#0078D4]/10 border-2 border-[#0078D4]/20 hover:border-[#0078D4]/40 hover:bg-[#0078D4]/15 transition-all duration-200 flex items-center gap-3 text-left"
                    >
                      <div className="w-8 h-8 bg-[#0078D4] rounded-m flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14.31 9.58c.25-.05.51-.08.78-.08 1.81 0 3.34 1.2 3.83 2.85.33-.1.68-.15 1.04-.15 1.89 0 3.43 1.54 3.43 3.43 0 1.89-1.54 3.43-3.43 3.43H6.52c-2.21 0-4-1.79-4-4 0-1.87 1.29-3.44 3.02-3.87.17-2.23 2.02-4 4.28-4 1.44 0 2.72.72 3.49 1.82.31-.27.68-.47 1.09-.59z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-secondary font-body font-bold truncate">
                          {matter.onedriveFolderName || "Documents"}
                        </p>
                        <p className="text-xs text-[#0078D4]">Open in OneDrive</p>
                      </div>
                      <svg className="w-4 h-4 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        if (confirm("Remove the OneDrive folder link from this matter?")) {
                          unlinkFolder({ matterId });
                        }
                      }}
                      className="text-xs text-secondary/50 hover:text-accent-error transition-colors"
                    >
                      Unlink folder
                    </button>
                  </div>
                ) : (
                  // No folder linked
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="w-full p-3 rounded-m bg-neutral-light/50 border-2 border-dashed border-neutral-light hover:border-primary/30 hover:bg-white transition-all duration-200 flex items-center gap-3 text-left"
                  >
                    <div className="w-8 h-8 bg-primary/20 rounded-m flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary font-body font-bold truncate">Documents</p>
                      <p className="text-xs text-secondary/50">Link OneDrive folder</p>
                    </div>
                    <svg className="w-4 h-4 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Card - full width */}
        <Card>
          <CardHeader className="mb-6">
            <CardTitle className="text-2xl font-heading font-extrabold text-secondary">Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add strategic notes, key considerations, action items..."
              className="min-h-[200px] bg-neutral-light/30 border-transparent focus:border-primary/30 focus:bg-white transition-colors"
            />
          </CardContent>
        </Card>
      </div>

      {/* Link OneDrive Folder Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setFolderUrl("");
        }}
        title="Link OneDrive Folder"
        className="max-w-lg"
      >
        <div className="space-y-6">
          {connectionStatus?.connected ? (
            <>
              <p className="text-secondary/70">
                Paste the URL of an existing OneDrive folder to link it to this matter. You can get the URL by right-clicking a folder in OneDrive and selecting &quot;Copy link&quot;.
              </p>
              <Input
                id="folderUrl"
                label="OneDrive Folder URL"
                placeholder="https://1drv.ms/... or https://onedrive.live.com/..."
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
              />
              <div className="flex justify-end gap-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowLinkModal(false);
                    setFolderUrl("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    if (!folderUrl.trim()) return;
                    setIsLinking(true);
                    try {
                      await linkFolder({
                        matterId,
                        folderUrl: folderUrl.trim(),
                      });
                      setShowLinkModal(false);
                      setFolderUrl("");
                    } catch (error) {
                      console.error("Failed to link folder:", error);
                    } finally {
                      setIsLinking(false);
                    }
                  }}
                  isLoading={isLinking}
                  disabled={!folderUrl.trim()}
                >
                  Link Folder
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-[#0078D4]/20 rounded-pill flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#0078D4]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.31 9.58c.25-.05.51-.08.78-.08 1.81 0 3.34 1.2 3.83 2.85.33-.1.68-.15 1.04-.15 1.89 0 3.43 1.54 3.43 3.43 0 1.89-1.54 3.43-3.43 3.43H6.52c-2.21 0-4-1.79-4-4 0-1.87 1.29-3.44 3.02-3.87.17-2.23 2.02-4 4.28-4 1.44 0 2.72.72 3.49 1.82.31-.27.68-.47 1.09-.59z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-bold text-secondary mb-2">
                  Connect OneDrive First
                </h3>
                <p className="text-secondary/60 mb-6">
                  To link OneDrive folders to your matters, first connect your OneDrive account in your profile settings.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </Button>
                  <Link href="/profile">
                    <Button>
                      Go to Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
