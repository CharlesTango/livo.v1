"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Doc } from "../../../convex/_generated/dataModel";

interface ClientCardProps {
  client: Doc<"clients">;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/clients/${client._id}`}>
      <Card hoverable className="h-full">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-accent/20 rounded-card flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-lg">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-primary truncate">{client.name}</h3>
            {client.company && (
              <p className="text-sm text-primary/60 truncate">{client.company}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-primary/50">
              {client.email && (
                <span className="flex items-center gap-1 truncate">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{client.email}</span>
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {client.phone}
                </span>
              )}
            </div>
            {client.industry && (
              <span className="inline-block mt-3 text-xs bg-secondary/50 text-primary/70 px-2 py-1 rounded-full">
                {client.industry}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
