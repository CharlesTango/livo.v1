"use client";

import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { formatDate, matterStatusColors, priorityColors } from "@/lib/utils";
import { Doc } from "../../../convex/_generated/dataModel";

interface MatterCardProps {
  matter: Doc<"matters">;
  clientName?: string;
}

export function MatterCard({ matter, clientName }: MatterCardProps) {
  return (
    <Link href={`/matters/${matter._id}`}>
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary rounded-m flex items-center justify-center shrink-0 shadow-subtle">
                <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-heading font-extrabold text-secondary truncate tracking-tight">{matter.title}</h3>
                {clientName && (
                  <p className="text-sm font-body font-bold text-secondary/50 mt-1 uppercase tracking-wider">{clientName}</p>
                )}
              </div>
            </div>
            
            {matter.description && (
              <p className="text-sm font-body font-medium text-secondary/60 mt-4 line-clamp-2 leading-relaxed">
                {matter.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Badge variant="default" className={matterStatusColors[matter.status]}>
                {matter.status.replace("-", " ")}
              </Badge>
              <Badge variant="default" className={priorityColors[matter.priority]}>
                {matter.priority}
              </Badge>
              <span className="text-xs font-bold bg-neutral-light text-secondary/50 px-3 py-1.5 rounded-pill uppercase tracking-widest">
                {matter.matterType.replace("-", " ")}
              </span>
            </div>
            
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-neutral-light text-xs font-bold text-secondary/40 uppercase tracking-widest">
              <span>Opened {formatDate(matter.openDate)}</span>
              {matter.dueDate && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Due {formatDate(matter.dueDate)}
                </span>
              )}
            </div>
          </div>
          <svg className="w-5 h-5 text-primary/30 shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
