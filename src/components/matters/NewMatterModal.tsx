"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Modal, Button, Input, Textarea, Select } from "@/components/ui";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

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

export function NewMatterModal({ isOpen, onClose, preselectedClientId }: NewMatterModalProps) {
  const createMatter = useMutation(api.matters.create);
  const clients = useQuery(api.clients.list);
  
  const [clientId, setClientId] = useState<string>(preselectedClientId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [matterType, setMatterType] = useState("contract");
  const [status, setStatus] = useState("open");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMatter({
        clientId: clientId as Id<"clients">,
        title,
        description: description || undefined,
        matterType,
        status,
        priority,
        openDate: Date.now(),
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        notes: notes || undefined,
      });
      
      // Reset form
      resetForm();
      onClose();
    } catch (err) {
      setError("Failed to create matter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setClientId(preselectedClientId || "");
    setTitle("");
    setDescription("");
    setMatterType("contract");
    setStatus("open");
    setPriority("medium");
    setDueDate("");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const clientOptions = [
    { value: "", label: "Select a client..." },
    ...(clients?.map((c) => ({ value: c._id, label: c.name + (c.company ? ` (${c.company})` : "") })) || []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Matter" className="max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Select
          id="client"
          label="Client *"
          options={clientOptions}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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

        <div className="flex justify-end gap-3 pt-4 border-t border-secondary/30">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Matter
          </Button>
        </div>
      </form>
    </Modal>
  );
}
