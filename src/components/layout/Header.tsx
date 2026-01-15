"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const user = useQuery(api.users.current);

  return (
    <header className="bg-white border-b border-secondary/30 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {description && (
            <p className="text-primary/60 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {actions}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-secondary/30">
              <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium text-primary">{user.name || "User"}</p>
                <p className="text-primary/50 text-xs">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
