"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";

export function AccountDropdown() {
  const user = useQuery(api.users.current);
  const { signOut } = useAuthActions();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  if (!user) return null;

  const userInitial = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 pl-6 border-l border-neutral-light/50 hover:opacity-80 transition-opacity cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-11 h-11 bg-primary rounded-pill flex items-center justify-center shadow-subtle border-2 border-white">
          <span className="text-secondary font-heading font-bold text-lg">
            {userInitial}
          </span>
        </div>
        <div className="text-sm text-left">
          <p className="font-bold text-secondary">{user.name || "User"}</p>
          <p className="text-secondary/50 font-medium">{user.email}</p>
        </div>
        <svg 
          className={`w-4 h-4 text-secondary/50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white rounded-l shadow-subtle border border-neutral-light/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-neutral-light/50">
            <p className="font-heading font-bold text-secondary truncate">{user.name || "User"}</p>
            <p className="text-sm text-secondary/50 font-medium truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-secondary hover:bg-primary/20 transition-colors duration-150"
            >
              <svg className="w-5 h-5 text-secondary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-neutral-light/50 pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-accent-error hover:bg-accent-error/10 transition-colors duration-150 w-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
