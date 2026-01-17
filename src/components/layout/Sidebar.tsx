"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: "Matters",
    href: "/matters",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: "Clients",
    href: "/clients",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside className="w-72 bg-white/40 backdrop-blur-xl border-r border-neutral-light/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-m flex items-center justify-center shadow-subtle">
            <span className="text-secondary font-heading font-extrabold text-2xl">L</span>
          </div>
          <span className="text-2xl font-heading font-extrabold text-secondary tracking-tight">Livo</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "sidebar-link",
                    isActive && "active"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-light/50">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-6 py-3 rounded-pill font-body text-accent-error hover:bg-accent-error/10 transition-all duration-200 w-full"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-bold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
