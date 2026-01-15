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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-primary truncate">{matter.title}</h3>
                {clientName && (
                  <p className="text-sm text-primary/60">{clientName}</p>
                )}
              </div>
            </div>
            
            {matter.description && (
              <p className="text-sm text-primary/60 mt-3 line-clamp-2">
                {matter.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <Badge className={matterStatusColors[matter.status] || "bg-secondary"}>
                {matter.status.replace("-", " ")}
              </Badge>
              <Badge className={priorityColors[matter.priority] || "bg-secondary"}>
                {matter.priority}
              </Badge>
              <span className="text-xs bg-secondary/50 text-primary/60 px-2 py-1 rounded-full">
                {matter.matterType.replace("-", " ")}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-4 text-xs text-primary/50">
              <span>Opened {formatDate(matter.openDate)}</span>
              {matter.dueDate && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
