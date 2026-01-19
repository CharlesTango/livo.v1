"use client";

import { AccountDropdown } from "./AccountDropdown";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
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
          <AccountDropdown />
        </div>
      </div>
    </header>
  );
}
