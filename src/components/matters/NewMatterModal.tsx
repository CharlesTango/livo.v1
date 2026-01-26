"use client";

import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal, Button, Input, Textarea, Select, Autocomplete } from "@/components/ui";
import type { AutocompleteOption } from "@/components/ui";
import { useEffect, useState, useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

interface NewMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: Id<"clients">;
}

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

type ModalStep = "form" | "confirm-new-client";

export function NewMatterModal({ isOpen, onClose, preselectedClientId }: NewMatterModalProps) {
  // Mutations for creating matters without OneDrive
  const createMatter = useMutation(api.matters.create);
  const createMatterWithNewClient = useMutation(api.matters.createWithNewClient);
  
  // Actions for creating matters with OneDrive folder creation
  const createMatterWithOneDrive = useAction(api.matters.createWithOneDrive);
  const createMatterWithNewClientAndOneDrive = useAction(api.matters.createWithNewClientAndOneDrive);
  
  const clients = useQuery(api.clients.list);
  const connectionStatus = useQuery(api.microsoft.getConnectionStatus);
  
  // Form state
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState<string | null>(preselectedClientId || null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [matterType, setMatterType] = useState("contract");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  
  // UI state
  const [step, setStep] = useState<ModalStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Build autocomplete options from clients
  const clientOptions: AutocompleteOption[] = useMemo(() => {
    if (!clients) return [];
    return clients.map((c) => ({
      value: c._id,
      label: c.name,
      sublabel: c.company || undefined,
    }));
  }, [clients]);

  // Set initial client name if preselected
  useEffect(() => {
    if (!preselectedClientId || !clients) return;
    const preselectedClient = clients.find((c) => c._id === preselectedClientId);
    if (!preselectedClient) return;
    setClientName(preselectedClient.name);
    setClientId(preselectedClientId);
  }, [preselectedClientId, clients]);

  // Check if client name matches an existing client exactly
  const matchingClient = useMemo(() => {
    if (!clientName.trim() || !clients) return null;
    return clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
  }, [clientName, clients]);

  // Determine if we need to create a new client
  const isNewClient = clientName.trim() && !clientId && !matchingClient;

  const handleClientChange = (text: string, selectedOption: AutocompleteOption | null) => {
    setClientName(text);
    setClientId(selectedOption?.value || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientName.trim()) {
      setError("Please enter a client name.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a matter title.");
      return;
    }

    // If this is a new client, show confirmation step
    if (isNewClient && step === "form") {
      setStep("confirm-new-client");
      return;
    }

    await submitMatter();
  };

  const submitMatter = async () => {
    setIsSubmitting(true);

    try {
      // Determine which client ID to use
      let finalClientId = clientId;
      
      // If user typed a name that exactly matches an existing client (case-insensitive), use that
      if (!finalClientId && matchingClient) {
        finalClientId = matchingClient._id;
      }

      // Check if OneDrive is connected - if so, use actions that create folders
      const useOneDrive = connectionStatus?.connected ?? false;

      if (finalClientId) {
        // Create matter with existing client
        if (useOneDrive) {
          await createMatterWithOneDrive({
            clientId: finalClientId as Id<"clients">,
            title,
            description: description || undefined,
            matterType,
            status,
            priority,
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
            notes: notes || undefined,
          });
        } else {
          await createMatter({
            clientId: finalClientId as Id<"clients">,
            title,
            description: description || undefined,
            matterType,
            status,
            priority,
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
            notes: notes || undefined,
          });
        }
      } else {
        // Create matter with new client
        if (useOneDrive) {
          await createMatterWithNewClientAndOneDrive({
            clientName: clientName.trim(),
            title,
            description: description || undefined,
            matterType,
            status,
            priority,
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
            notes: notes || undefined,
          });
        } else {
          await createMatterWithNewClient({
            clientName: clientName.trim(),
            title,
            description: description || undefined,
            matterType,
            status,
            priority,
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
            notes: notes || undefined,
          });
        }
      }
      
      // Reset form and close
      resetForm();
      onClose();
    } catch (err) {
      setError("Failed to create matter. Please try again.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientId(preselectedClientId || null);
    setTitle("");
    setDescription("");
    setMatterType("contract");
    setStatus("open");
    setPriority("medium");
    setDueDate("");
    setNotes("");
    setError("");
    setStep("form");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleGoBack = () => {
    setStep("form");
  };

  // Render confirmation dialog for new client
  if (step === "confirm-new-client") {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Client?" className="max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-pill flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          
          <p className="text-lg font-heading font-bold text-secondary mb-2">
            Client not found
          </p>
          <p className="text-secondary/60 mb-8">
            &quot;{clientName}&quot; doesn&apos;t exist in your clients. Would you like to create a new client with this name?
          </p>

          {error && (
            <div className="bg-accent-error/10 border-2 border-accent-error/20 text-accent-error px-6 py-4 rounded-m mb-6 font-body font-bold text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={submitMatter} 
              isLoading={isSubmitting}
              className="w-full"
            >
              Yes, Create New Client
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              disabled={isSubmitting}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Matter" className="max-w-3xl">
      {error && (
        <div className="bg-accent-error/10 border-2 border-accent-error/20 text-accent-error px-6 py-4 rounded-m mb-8 font-body font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Autocomplete
          id="client"
          label="Client *"
          options={clientOptions}
          value={clientName}
          selectedId={clientId}
          onChange={handleClientChange}
          placeholder="Search existing clients or enter a new name..."
          emptyMessage="No matching clients"
          required
        />

        <Input
          id="title"
          label="Matter Title *"
          placeholder="Software License Agreement Review"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          id="description"
          label="Description"
          placeholder="Brief description of the legal matter..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Select
            id="matterType"
            label="Matter Type"
            options={matterTypes}
            value={matterType}
            onChange={(e) => setMatterType(e.target.value)}
          />
          <Select
            id="status"
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <Select
            id="priority"
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </div>

        <Input
          id="dueDate"
          type="date"
          label="Due Date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Textarea
          id="notes"
          label="Notes"
          placeholder="Additional notes, key considerations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* OneDrive Status */}
        <div className="pt-4 border-t border-neutral-light">
          {connectionStatus?.connected ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-[#0078D4]/20 rounded-m flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-[#0078D4]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.31 9.58c.25-.05.51-.08.78-.08 1.81 0 3.34 1.2 3.83 2.85.33-.1.68-.15 1.04-.15 1.89 0 3.43 1.54 3.43 3.43 0 1.89-1.54 3.43-3.43 3.43H6.52c-2.21 0-4-1.79-4-4 0-1.87 1.29-3.44 3.02-3.87.17-2.23 2.02-4 4.28-4 1.44 0 2.72.72 3.49 1.82.31-.27.68-.47 1.09-.59z"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-secondary font-medium">OneDrive folder will be created</p>
                <p className="text-xs text-secondary/50">A folder will be automatically created in your OneDrive</p>
              </div>
              <svg className="w-5 h-5 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-neutral-light rounded-m flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-secondary/60 font-medium">No document folder</p>
                <p className="text-xs text-secondary/40">
                  <Link href="/profile" className="text-primary hover:underline">Connect OneDrive</Link>
                  {" "}to auto-create folders
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} className="px-8">
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="px-8">
            Create Matter
          </Button>
        </div>
      </form>
    </Modal>
  );
}
