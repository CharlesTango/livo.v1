"use client";

import { useState, useMemo } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Input, Badge, Button } from "@/components/ui";

interface ClauseData {
  _id: string;
  agreementId: string;
  agreementName: string;
  clauseType: string;
  title: string;
  text: string;
  summary: string;
  riskLevel: string;
  favorability: string;
  x?: number;
  y?: number;
  clusterId?: number;
  isOutlier?: boolean;
}

interface ClauseExplorerProps {
  clauses: ClauseData[];
}

const riskBadgeColors: Record<string, string> = {
  low: "bg-accent-success/10 text-accent-success",
  medium: "bg-primary-yellow/20 text-secondary",
  high: "bg-accent-error/10 text-accent-error",
};

const favBadgeColors: Record<string, string> = {
  "provider-favorable": "bg-accent-error/10 text-accent-error",
  neutral: "bg-primary-yellow/20 text-secondary",
  "customer-favorable": "bg-accent-success/10 text-accent-success",
};

export function ClauseExplorer({ clauses }: ClauseExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [similarResults, setSimilarResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const searchSimilar = useAction(api.vectorDb.searchSimilarClauses);

  // Get unique clause types
  const clauseTypes = useMemo(
    () => [...new Set(clauses.map((c) => c.clauseType))].sort(),
    [clauses]
  );

  const filteredClauses = useMemo(() => {
    return clauses.filter((c) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !c.title.toLowerCase().includes(term) &&
          !c.summary.toLowerCase().includes(term) &&
          !c.agreementName.toLowerCase().includes(term) &&
          !c.clauseType.toLowerCase().includes(term)
        ) {
          return false;
        }
      }
      if (typeFilter && c.clauseType !== typeFilter) return false;
      if (riskFilter && c.riskLevel !== riskFilter) return false;
      return true;
    });
  }, [clauses, searchTerm, typeFilter, riskFilter]);

  const handleFindSimilar = async (clauseText: string) => {
    setSearching(true);
    setSimilarResults(null);
    try {
      const results = await searchSimilar({
        text: clauseText,
        limit: 5,
      });
      setSimilarResults(results as any[]);
    } catch (e: any) {
      console.error("Search error:", e);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-subtle p-6 border-none">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-extrabold text-secondary">
          Clause Explorer
        </h3>
        <p className="text-sm text-secondary/50 font-body mt-1">
          Browse, filter, and search across all agreement clauses.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[250px] max-w-sm">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              id="clause-search"
              placeholder="Search clauses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
            />
          </div>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-neutral rounded-pill font-body text-sm text-secondary border-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Types</option>
          {clauseTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="px-4 py-2.5 bg-neutral rounded-pill font-body text-sm text-secondary border-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="high">High Risk</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-secondary/50 font-body mb-4">
        Showing {filteredClauses.length} of {clauses.length} clauses
      </p>

      {/* Clause list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {filteredClauses.map((clause) => {
          const isExpanded = expandedId === clause._id;
          return (
            <div
              key={clause._id}
              className={cn(
                "border border-neutral-light/50 rounded-m transition-all",
                isExpanded ? "bg-neutral/30" : "hover:bg-neutral/20"
              )}
            >
              {/* Header */}
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3"
                onClick={() => setExpandedId(isExpanded ? null : clause._id)}
              >
                <svg
                  className={cn(
                    "w-4 h-4 text-secondary/40 transition-transform shrink-0",
                    isExpanded && "rotate-90"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-secondary text-sm truncate">
                      {clause.title}
                    </span>
                    {clause.isOutlier && (
                      <span className="text-[10px] font-bold bg-accent-error/10 text-accent-error px-1.5 py-0.5 rounded-pill shrink-0">
                        Outlier
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-secondary/50 font-body">
                    {clause.agreementName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold bg-neutral-light text-secondary/60 px-2 py-1 rounded-pill uppercase tracking-wider">
                    {clause.clauseType}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-pill",
                      riskBadgeColors[clause.riskLevel]
                    )}
                  >
                    {clause.riskLevel}
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-neutral-light/50">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-[10px] text-secondary/40 font-body uppercase tracking-wider mb-1">
                        Summary
                      </p>
                      <p className="text-xs text-secondary/70 font-body leading-relaxed">
                        {clause.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-secondary/40 font-body uppercase tracking-wider mb-1">
                        Details
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="default"
                          className={riskBadgeColors[clause.riskLevel]}
                        >
                          {clause.riskLevel} risk
                        </Badge>
                        <Badge
                          variant="default"
                          className={favBadgeColors[clause.favorability]}
                        >
                          {clause.favorability}
                        </Badge>
                        {clause.clusterId !== undefined && (
                          <Badge variant="info">
                            Cluster {clause.clusterId + 1}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] text-secondary/40 font-body uppercase tracking-wider mb-1">
                      Original Text
                    </p>
                    <p className="text-xs text-secondary/60 font-body leading-relaxed bg-white/60 rounded-s p-3 max-h-32 overflow-y-auto">
                      {clause.text}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFindSimilar(clause.text)}
                    isLoading={searching}
                    className="text-xs"
                  >
                    <svg
                      className="w-3.5 h-3.5 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Find Similar Clauses
                  </Button>

                  {/* Similar results */}
                  {similarResults && (
                    <div className="mt-3 border-t border-neutral-light/50 pt-3">
                      <p className="text-[10px] text-secondary/40 font-body uppercase tracking-wider mb-2">
                        Similar Clauses ({similarResults.length})
                      </p>
                      <div className="space-y-2">
                        {similarResults.map((result: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 bg-white/60 rounded-s p-2.5"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-secondary truncate">
                                {result.title}
                              </p>
                              <p className="text-[10px] text-secondary/50">
                                {result.agreementName} &middot;{" "}
                                {result.clauseType}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-primary shrink-0">
                              {(result._score * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
