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
    <header className="bg-white/40 backdrop-blur-md border-b border-neutral-light/50 px-8 py-8 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-extrabold text-secondary tracking-tight">{title}</h1>
          {description && (
            <p className="text-secondary/60 mt-2 font-body font-medium">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-6">
          {actions}
          {user && (
            <div className="flex items-center gap-4 pl-6 border-l border-neutral-light/50">
              <div className="w-11 h-11 bg-primary rounded-pill flex items-center justify-center shadow-subtle border-2 border-white">
                <span className="text-secondary font-heading font-bold text-lg">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-bold text-secondary">{user.name || "User"}</p>
                <p className="text-secondary/50 font-medium">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
