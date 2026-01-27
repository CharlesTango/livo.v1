import React, { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";


type FormStep = "form" | "confirm-new-client" | "success";

interface ClientOption {
  _id: Id<"clients">;
  name: string;
  company?: string | null;
}

export function CreateMatterForm() {
  // Mutations for creating matters
  const createMatter = useMutation(api.matters.create);
  const createMatterWithNewClient = useMutation(api.matters.createWithNewClient);
  const createMatterWithOneDrive = useAction(api.matters.createWithOneDrive);
  const createMatterWithNewClientAndOneDrive = useAction(api.matters.createWithNewClientAndOneDrive);

  // Queries
  const clients = useQuery(api.clients.list);
  const connectionStatus = useQuery(api.microsoft.getConnectionStatus);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // UI state
  const [step, setStep] = useState<FormStep>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Filter clients based on input
  const filteredClients = useMemo(() => {
    if (!clients || !clientName.trim()) return clients || [];
    return clients.filter((c: ClientOption) =>
      c.name.toLowerCase().includes(clientName.toLowerCase())
    );
  }, [clients, clientName]);

  // Check if client name matches an existing client exactly
  const matchingClient = useMemo(() => {
    if (!clientName.trim() || !clients) return null;
    return clients.find((c: ClientOption) => c.name.toLowerCase() === clientName.toLowerCase());
  }, [clientName, clients]);

  // Determine if we need to create a new client
  const isNewClient = clientName.trim() && !clientId && !matchingClient;

  const handleClientSelect = (client: ClientOption) => {
    setClientName(client.name);
    setClientId(client._id);
    setShowClientDropdown(false);
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

      // If user typed a name that exactly matches an existing client, use that
      if (!finalClientId && matchingClient) {
        finalClientId = matchingClient._id;
      }

      // Check if OneDrive is connected
      const useOneDrive = connectionStatus?.connected ?? false;

      if (finalClientId) {
        // Create matter with existing client
        if (useOneDrive) {
          await createMatterWithOneDrive({
            clientId: finalClientId as Id<"clients">,
            title,
            description: description || undefined,
            matterType: "contract",
            status: "open",
            priority: "medium",
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
          });
        } else {
          await createMatter({
            clientId: finalClientId as Id<"clients">,
            title,
            description: description || undefined,
            matterType: "contract",
            status: "open",
            priority: "medium",
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
          });
        }
      } else {
        // Create matter with new client
        if (useOneDrive) {
          await createMatterWithNewClientAndOneDrive({
            clientName: clientName.trim(),
            title,
            description: description || undefined,
            matterType: "contract",
            status: "open",
            priority: "medium",
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
          });
        } else {
          await createMatterWithNewClient({
            clientName: clientName.trim(),
            title,
            description: description || undefined,
            matterType: "contract",
            status: "open",
            priority: "medium",
            openDate: Date.now(),
            dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
          });
        }
      }

      // Show success state
      setStep("success");
    } catch (err) {
      setError("Failed to create matter. Please try again.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientId(null);
    setTitle("");
    setDescription("");
    setDueDate("");
    setError("");
    setStep("form");
  };

  // Success state
  if (step === "success") {
    return (
      <div className="success-container">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="success-title">Matter Created!</h2>
        <p className="success-message">
          Your matter &quot;{title}&quot; has been created successfully.
        </p>
        <button onClick={resetForm} className="btn-primary btn-full">
          Create Another Matter
        </button>
      </div>
    );
  }

  // Confirm new client step
  if (step === "confirm-new-client") {
    return (
      <div className="confirm-container">
        <div className="confirm-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="confirm-title">Create New Client?</h2>
        <p className="confirm-message">
          &quot;{clientName}&quot; doesn&apos;t exist in your clients. Would you like to create a new client with this name?
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="confirm-actions">
          <button
            onClick={submitMatter}
            className="btn-primary btn-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Yes, Create New Client"}
          </button>
          <button
            onClick={() => setStep("form")}
            className="btn-ghost btn-full"
            disabled={isSubmitting}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="form-container">
      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit} className="matter-form">
        {/* Client Field with Autocomplete */}
        <div className="form-group">
          <label htmlFor="client" className="label">
            Client <span className="required">*</span>
          </label>
          <div className="autocomplete-container">
            <input
              id="client"
              type="text"
              className="input"
              placeholder="Search existing clients or enter a new name..."
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setClientId(null);
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
              required
            />
            {showClientDropdown && filteredClients && filteredClients.length > 0 && (
              <div className="autocomplete-dropdown">
                {filteredClients.slice(0, 5).map((client: ClientOption) => (
                  <button
                    key={client._id}
                    type="button"
                    className={`autocomplete-option ${clientId === client._id ? "selected" : ""}`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <span className="option-name">{client.name}</span>
                    {client.company && (
                      <span className="option-company">{client.company}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {isNewClient && clientName.trim() && (
              <div className="new-client-badge">
                + New Client
              </div>
            )}
          </div>
        </div>

        {/* Matter Title */}
        <div className="form-group">
          <label htmlFor="title" className="label">
            Matter Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="Software License Agreement Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            className="input textarea"
            placeholder="Brief description of the legal matter..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Due Date */}
        <div className="form-group">
          <label htmlFor="dueDate" className="label">Due Date</label>
          <input
            id="dueDate"
            type="date"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* OneDrive Status */}
        <div className="onedrive-status">
          {connectionStatus?.connected ? (
            <div className="onedrive-connected">
              <div className="onedrive-icon connected">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.31 9.58c.25-.05.51-.08.78-.08 1.81 0 3.34 1.2 3.83 2.85.33-.1.68-.15 1.04-.15 1.89 0 3.43 1.54 3.43 3.43 0 1.89-1.54 3.43-3.43 3.43H6.52c-2.21 0-4-1.79-4-4 0-1.87 1.29-3.44 3.02-3.87.17-2.23 2.02-4 4.28-4 1.44 0 2.72.72 3.49 1.82.31-.27.68-.47 1.09-.59z" />
                </svg>
              </div>
              <div className="onedrive-text">
                <p className="onedrive-title">OneDrive folder will be created</p>
                <p className="onedrive-subtitle">A folder will be automatically created</p>
              </div>
              <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="onedrive-disconnected">
              <div className="onedrive-icon disconnected">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="onedrive-text">
                <p className="onedrive-title muted">No document folder</p>
                <p className="onedrive-subtitle">Connect OneDrive in the web app</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
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
              Creating...
            </span>
          ) : (
            "Create Matter"
          )}
        </button>
      </form>
    </div>
  );
}
