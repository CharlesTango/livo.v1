"use client";

import { cn } from "@/lib/utils";

interface Stats {
  agreementCount: number;
  clauseCount: number;
  clusterCount: number;
  outlierCount: number;
  clauseTypeDistribution: Record<string, number>;
  riskDistribution: { low: number; medium: number; high: number };
  favorabilityDistribution: {
    "provider-favorable": number;
    neutral: number;
    "customer-favorable": number;
  };
  providers: string[];
  hasAnalysis: boolean;
}

interface StatsOverviewProps {
  stats: Stats;
}

const statCards = [
  {
    key: "agreementCount" as const,
    label: "Agreements",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "bg-primary/20 text-secondary",
    iconBg: "bg-primary",
  },
  {
    key: "clauseCount" as const,
    label: "Clauses",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    color: "bg-primary-yellow/20 text-secondary",
    iconBg: "bg-primary-yellow",
  },
  {
    key: "clusterCount" as const,
    label: "Clusters",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    ),
    color: "bg-accent-success/10 text-accent-success",
    iconBg: "bg-accent-success",
  },
  {
    key: "outlierCount" as const,
    label: "Outliers",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    color: "bg-accent-error/10 text-accent-error",
    iconBg: "bg-accent-error",
  },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <div
          key={card.key}
          className="bg-white rounded-card shadow-subtle p-6 border-none"
        >
          <div className="flex items-center gap-4 mb-3">
            <div
              className={cn(
                "w-12 h-12 rounded-m flex items-center justify-center text-white",
                card.iconBg
              )}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-3xl font-heading font-extrabold text-secondary">
                {stats[card.key]}
              </p>
              <p className="text-sm font-body text-secondary/60 font-medium">
                {card.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
