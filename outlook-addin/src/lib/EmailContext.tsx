import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

declare const Office: any;

export interface EmailInfo {
  subject: string;
  from: string;
  to: string;
  dateReceived: string;
  attachmentCount: number;
  attachments: AttachmentInfo[];
  itemId?: string;
}

export interface AttachmentInfo {
  name: string;
  contentType: string;
  size: number;
  id: string;
}

interface EmailContextValue {
  currentEmail: EmailInfo | null;
  hasEmail: boolean;
  isLoading: boolean;
  refreshEmail: () => void;
}

const EmailContext = createContext<EmailContextValue | undefined>(undefined);

/**
 * Extract email info from the current Office.context.mailbox.item
 */
function extractEmailInfo(item: any): EmailInfo | null {
  if (!item) return null;

  try {
    const attachments: AttachmentInfo[] = item.attachments
      ? item.attachments.map((att: any) => ({
          name: att.name,
          contentType: att.contentType,
          size: att.size,
          id: att.id,
        }))
      : [];

    return {
      subject: item.subject || "No Subject",
      from: item.from?.emailAddress || item.sender?.emailAddress || "Unknown",
      to: item.to?.map((r: any) => r.emailAddress).join(", ") || "",
      dateReceived: item.dateTimeCreated?.toISOString() || new Date().toISOString(),
      attachmentCount: attachments.length,
      attachments,
      itemId: item.itemId,
    };
  } catch (error) {
    console.error("Error extracting email info:", error);
    return null;
  }
}

interface EmailProviderProps {
  children: ReactNode;
}

export function EmailProvider({ children }: EmailProviderProps) {
  const [currentEmail, setCurrentEmail] = useState<EmailInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Refresh the current email from Office.context.mailbox.item
   */
  const refreshEmail = useCallback(() => {
    if (typeof Office !== "undefined" && Office.context?.mailbox) {
      const item = Office.context.mailbox.item;
      const emailInfo = extractEmailInfo(item);
      setCurrentEmail(emailInfo);
    } else {
      setCurrentEmail(null);
    }
    setIsLoading(false);
  }, []);

  /**
   * Handle item changed event (when user selects a different email)
   */
  const handleItemChanged = useCallback(() => {
    // Small delay to ensure Office.context.mailbox.item is updated
    setTimeout(() => {
      refreshEmail();
    }, 100);
  }, [refreshEmail]);

  useEffect(() => {
    // Initial load
    const initializeEmailContext = () => {
      if (typeof Office === "undefined") {
        setIsLoading(false);
        return;
      }

      // Wait for Office to be ready
      Office.onReady(() => {
        // Get initial email
        refreshEmail();

        // Register ItemChanged event handler for pinnable task pane
        if (Office.context?.mailbox?.addHandlerAsync) {
          Office.context.mailbox.addHandlerAsync(
            Office.EventType.ItemChanged,
            handleItemChanged,
            (result: any) => {
              if (result.status !== Office.AsyncResultStatus.Succeeded) {
                console.warn("Failed to register ItemChanged handler:", result.error);
              }
            }
          );
        }
      });
    };

    initializeEmailContext();

    // Cleanup: remove event handler on unmount
    return () => {
      if (typeof Office !== "undefined" && Office.context?.mailbox?.removeHandlerAsync) {
        Office.context.mailbox.removeHandlerAsync(
          Office.EventType.ItemChanged,
          { handler: handleItemChanged },
          () => {} // Ignore errors on cleanup
        );
      }
    };
  }, [refreshEmail, handleItemChanged]);

  const value: EmailContextValue = {
    currentEmail,
    hasEmail: currentEmail !== null,
    isLoading,
    refreshEmail,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
}

/**
 * Hook to access the current email context
 */
export function useEmail(): EmailContextValue {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error("useEmail must be used within an EmailProvider");
  }
  return context;
}
