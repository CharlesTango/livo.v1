import React from "react";
import type { EmailInfo } from "../lib/EmailContext";

type ViewType = "menu" | "create-matter" | "add-to-matter";

interface MainMenuProps {
  onSelectView: (view: ViewType) => void;
  hasEmail: boolean;
  currentEmail: EmailInfo | null;
}

export function MainMenu({ onSelectView, hasEmail, currentEmail }: MainMenuProps) {
  return (
    <div className="menu-container">
      {/* Header */}
      <div className="menu-header">
        <div className="logo-container">
          <img
            src="/assets/livo-logo-medium.png"
            alt="Livo"
            className="logo-image"
          />
        </div>
        <p className="menu-subtitle">What would you like to do?</p>
      </div>

      {/* Current Email Indicator */}
      <div className={`current-email-indicator ${hasEmail ? "" : "no-email"}`}>
        <div className={`current-email-dot ${hasEmail ? "active" : "inactive"}`} />
        <div className="current-email-info">
          <p className="current-email-label">
            {hasEmail ? "Selected email" : "No email selected"}
          </p>
          {hasEmail && currentEmail ? (
            <p className="current-email-subject">{currentEmail.subject}</p>
          ) : (
            <p className="current-email-placeholder">
              Select an email to add it to a matter
            </p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="menu-options">
        {/* Create Matter Option */}
        <button
          className="menu-option-card"
          onClick={() => onSelectView("create-matter")}
        >
          <div className="option-icon create-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="option-content">
            <h3 className="option-title">Create Matter</h3>
            <p className="option-description">
              Create a new legal matter with a client and OneDrive folder
            </p>
          </div>
          <div className="option-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Add to Matter Option */}
        <button
          className="menu-option-card"
          onClick={() => onSelectView("add-to-matter")}
        >
          <div className="option-icon add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="option-content">
            <h3 className="option-title">Add to Matter</h3>
            <p className="option-description">
              {hasEmail 
                ? "Save this email and attachments to an existing matter"
                : "Select an email first to add it to a matter"
              }
            </p>
          </div>
          <div className="option-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
