import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { EmailInfo } from "../lib/EmailContext";

declare const Office: any;

interface ClientOption {
  _id: Id<"clients">;
  name: string;
  company?: string | null;
}

interface MatterOption {
  _id: Id<"matters">;
  title: string;
  status: string;
  onedriveFolderId?: string;
}

interface AddToMatterFormProps {
  onBack?: () => void;
  currentEmail: EmailInfo | null;
}

interface AttachmentInfo {
  name: string;
  contentType: string;
  size: number;
  id: string;
}

export function AddToMatterForm({ onBack, currentEmail }: AddToMatterFormProps) {
  // Queries
  const clients = useQuery(api.clients.list);
  const connectionStatus = useQuery(api.microsoft.getConnectionStatus);
  
  // Actions
  const uploadEmailToMatter = useAction(api.microsoft.uploadEmailToMatter);

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState<Id<"clients"> | null>(null);
  const [matterId, setMatterId] = useState<Id<"matters"> | null>(null);
  const [includeAttachments, setIncludeAttachments] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we have an email selected
  const hasEmail = currentEmail !== null;
  const emailSubject = currentEmail?.subject || "";
  const attachmentCount = currentEmail?.attachmentCount || 0;
  const attachments = currentEmail?.attachments || [];

  // Fetch matters for selected client
  const mattersForClient = useQuery(
    api.matters.list,
    clientId ? { clientId } : "skip"
  );

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Filter clients based on input
  const filteredClients = useMemo(() => {
    if (!clients || !clientName.trim()) return clients || [];
    return clients.filter((c: ClientOption) =>
      c.name.toLowerCase().includes(clientName.toLowerCase())
    );
  }, [clients, clientName]);

  // Filter matters with OneDrive folders only
  const availableMatters = useMemo(() => {
    if (!mattersForClient) return [];
    // Only show matters that have OneDrive folders set up
    return mattersForClient.filter((m: MatterOption) => m.onedriveFolderId);
  }, [mattersForClient]);

  // Get selected matter
  const selectedMatter = useMemo(() => {
    if (!matterId || !mattersForClient) return null;
    return mattersForClient.find((m: MatterOption) => m._id === matterId);
  }, [matterId, mattersForClient]);

  const handleClientSelect = (client: ClientOption) => {
    setClientName(client.name);
    setClientId(client._id);
    setMatterId(null); // Reset matter selection when client changes
    setShowClientDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasEmail) {
      setError("Please select an email first.");
      return;
    }

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!matterId) {
      setError("Please select a matter.");
      return;
    }

    if (!selectedMatter?.onedriveFolderId) {
      setError("Selected matter does not have a OneDrive folder configured.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get email data from Office.js (need the full item for body content)
      const item = Office.context.mailbox.item;
      
      if (!item) {
        throw new Error("Email is no longer available. Please select an email and try again.");
      }
      
      // Get email body
      const bodyResult = await new Promise<{ value: string; format: string }>((resolve, reject) => {
        item.body.getAsync(Office.CoercionType.Html, (result: any) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve({ value: result.value, format: "html" });
          } else {
            // Fallback to text
            item.body.getAsync(Office.CoercionType.Text, (textResult: any) => {
              if (textResult.status === Office.AsyncResultStatus.Succeeded) {
                resolve({ value: textResult.value, format: "text" });
              } else {
                reject(new Error("Failed to get email body"));
              }
            });
          }
        });
      });

      // Get sender and recipients
      const from = item.from?.emailAddress || item.sender?.emailAddress || "Unknown";
      const to = item.to?.map((r: any) => r.emailAddress).join(", ") || "Unknown";
      const dateReceived = item.dateTimeCreated?.toISOString() || new Date().toISOString();

      // Prepare email data
      const emailData = {
        subject: item.subject || "No Subject",
        from,
        to,
        date: dateReceived,
        body: bodyResult.value,
        bodyType: bodyResult.format,
      };

      // Get attachments if checkbox is checked
      let attachmentData: Array<{ name: string; contentType: string; contentBase64: string }> | undefined;
      
      if (includeAttachments && attachments.length > 0) {
        attachmentData = await Promise.all(
          attachments.map(async (att) => {
            return new Promise<{ name: string; contentType: string; contentBase64: string }>((resolve, reject) => {
              item.getAttachmentContentAsync(att.id, (result: any) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                  resolve({
                    name: att.name,
                    contentType: att.contentType,
                    contentBase64: result.value.content,
                  });
                } else {
                  reject(new Error(`Failed to get attachment: ${att.name}`));
                }
              });
            });
          })
        );
      }

      // Upload to OneDrive
      await uploadEmailToMatter({
        matterId,
        emailData,
        attachments: attachmentData,
      });

      // Show toast and start auto-redirect timer
      setShowToast(true);
      toastTimerRef.current = setTimeout(() => {
        setShowToast(false);
        onBack?.();
      }, 3000);
    } catch (err: any) {
      console.error("Failed to add email to matter:", err);
      setError(err.message || "Failed to add email to matter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle undo - cancel the timer and stay on the form
  const handleUndo = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setShowToast(false);
  };

  // Main form
  return (
    <div className="form-container">
      {/* Success Toast */}
      {showToast && (
        <div className="toast-container">
          <div className="toast toast-success">
            <div className="toast-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="toast-message">Added to matter</span>
            <button type="button" className="toast-undo" onClick={handleUndo}>
              Undo
            </button>
          </div>
        </div>
      )}

      {/* Back Button */}
      {onBack && (
        <button type="button" className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      {/* Form Header */}
      <div className="form-header-title">
        <h2>Add to Matter</h2>
      </div>

      {/* Email Preview */}
      {hasEmail ? (
        <div className="email-preview">
          <div className="email-preview-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="email-preview-content">
            <p className="email-preview-subject">{emailSubject}</p>
            {attachmentCount > 0 && (
              <p className="email-preview-attachments">
                {attachmentCount} attachment{attachmentCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="no-email-notice">
          <div className="no-email-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="no-email-content">
            <p className="no-email-title">No email selected</p>
            <p className="no-email-hint">Select an email from your inbox to add it to a matter</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* OneDrive Warning */}
      {!connectionStatus?.connected && (
        <div className="warning-message">
          OneDrive is not connected. Connect OneDrive in the web app to save emails to matters.
        </div>
      )}

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
              placeholder="Search for a client..."
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setClientId(null);
                setMatterId(null);
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
          </div>
        </div>

        {/* Matter Selection */}
        <div className="form-group">
          <label htmlFor="matter" className="label">
            Matter <span className="required">*</span>
          </label>
          <select
            id="matter"
            className="input select"
            value={matterId || ""}
            onChange={(e) => setMatterId(e.target.value as Id<"matters"> || null)}
            disabled={!clientId || !availableMatters.length}
            required
          >
            <option value="">
              {!clientId
                ? "Select a client first"
                : availableMatters.length === 0
                ? "No matters with OneDrive folders"
                : "Select a matter..."}
            </option>
            {availableMatters.map((matter: MatterOption) => (
              <option key={matter._id} value={matter._id}>
                {matter.title} ({matter.status})
              </option>
            ))}
          </select>
          {clientId && mattersForClient && mattersForClient.length > 0 && availableMatters.length === 0 && (
            <p className="field-hint warning">
              Matters exist but none have OneDrive folders. Create folders in the web app.
            </p>
          )}
        </div>

        {/* Include Attachments Checkbox */}
        {attachmentCount > 0 && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox"
                checked={includeAttachments}
                onChange={(e) => setIncludeAttachments(e.target.checked)}
              />
              <span className="checkbox-text">
                Include {attachmentCount} attachment{attachmentCount > 1 ? "s" : ""}
              </span>
            </label>
            {includeAttachments && (
              <div className="attachments-list">
                {attachments.map((att, index) => (
                  <div key={index} className="attachment-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="attachment-name">{att.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary btn-full"
          disabled={isSubmitting || !clientId || !matterId || !connectionStatus?.connected || !hasEmail}
        >
          {isSubmitting ? (
            <span className="btn-loading">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" />
                <circle className="spinner-head" cx="12" cy="12" r="10" />
              </svg>
              Saving...
            </span>
          ) : !hasEmail ? (
            "Select an email first"
          ) : (
            "Save to Matter"
          )}
        </button>
      </form>
    </div>
  );
}
