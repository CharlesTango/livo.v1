"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout";
import {
  StatsOverview,
  SimilarityMap,
  AgreementMatrix,
  InsightsPanel,
  ClauseExplorer,
  RiskAnalysis,
} from "@/components/intelligence";
import { useMemo } from "react";

export default function IntelligencePage() {
  const stats = useQuery(api.vectorDb.getStats, {});
  const allClauses = useQuery(api.vectorDb.listAllClauses, {});
  const agreements = useQuery(api.vectorDb.listAgreements, {});
  const analysisResults = useQuery(api.vectorDb.getAnalysisResults, {});

  // Detailed clauses for the explorer (need text field)
  const clausesByAgreement = useQuery(
    api.vectorDb.listClausesByAgreement,
    agreements && agreements.length > 0
      ? { agreementId: agreements[0]._id }
      : "skip"
  );

  // Extract analysis data
  const similarityMatrix = useMemo(() => {
    if (!analysisResults) return null;
    const result = analysisResults.find(
      (r) => r.analysisType === "similarity_matrix"
    );
    return result?.data as {
      matrix: number[][];
      labels: string[];
      providers: string[];
    } | null;
  }, [analysisResults]);

  const insights = useMemo(() => {
    if (!analysisResults) return [];
    const result = analysisResults.find(
      (r) => r.analysisType === "insights"
    );
    return (result?.data as any)?.insights || [];
  }, [analysisResults]);

  const riskData = useMemo(() => {
    if (!analysisResults) return null;
    const result = analysisResults.find(
      (r) => r.analysisType === "risk_analysis"
    );
    return result?.data as any;
  }, [analysisResults]);

  // Loading state
  if (stats === undefined || allClauses === undefined || agreements === undefined) {
    return (
      <>
        <Header
          title="Agreement Intelligence"
          description="Vector-powered analysis of SaaS agreements, clauses, and market patterns."
        />
        <div className="flex-1 p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-card shadow-subtle p-6 animate-pulse">
                <div className="h-12 bg-neutral-light rounded-m w-12 mb-3" />
                <div className="h-8 bg-neutral-light rounded-s w-16 mb-2" />
                <div className="h-4 bg-neutral-light rounded-s w-20" />
              </div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-card shadow-subtle animate-pulse" />
        </div>
      </>
    );
  }

  // Empty state - no data yet
  if (stats.agreementCount === 0) {
    return (
      <>
        <Header
          title="Agreement Intelligence"
          description="Vector-powered analysis of SaaS agreements, clauses, and market patterns."
        />
        <div className="flex-1 p-8">
          <div className="text-center py-20 bg-white/40 rounded-l shadow-subtle">
            <div className="w-20 h-20 bg-primary/20 rounded-pill flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <p className="text-xl font-heading font-bold text-secondary/60 mb-4">
              Vector Database Not Yet Populated
            </p>
            <p className="text-secondary/50 mb-8 max-w-lg mx-auto font-body">
              Run the seed script to process the SaaS agreements and populate the
              vector database with embeddings and analysis.
            </p>
            <div className="bg-secondary/5 rounded-m p-6 max-w-md mx-auto text-left">
              <p className="text-xs font-body text-secondary/40 uppercase tracking-wider mb-3">
                Setup Instructions
              </p>
              <ol className="space-y-3 text-sm font-body text-secondary/70">
                <li className="flex gap-2">
                  <span className="font-bold text-secondary shrink-0">1.</span>
                  <span>
                    Add <code className="bg-neutral-light px-1.5 py-0.5 rounded text-xs">VOYAGE_API_KEY</code> to
                    Convex environment variables
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-secondary shrink-0">2.</span>
                  <span>
                    Ensure <code className="bg-neutral-light px-1.5 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code> is
                    set in Convex environment variables
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-secondary shrink-0">3.</span>
                  <span>
                    Run:{" "}
                    <code className="bg-neutral-light px-1.5 py-0.5 rounded text-xs">
                      npx tsx scripts/seed-vector-db.ts
                    </code>
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Agreement Intelligence"
        description={`Analyzing ${stats.agreementCount} agreements with ${stats.clauseCount} clauses from ${stats.providers.length} providers.`}
      />

      <div className="flex-1 p-8 space-y-8">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Main content: Similarity Map + Insights */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <SimilarityMap clauses={allClauses} />
          </div>
          <div className="xl:col-span-1">
            <InsightsPanel insights={insights} />
          </div>
        </div>

        {/* Agreement Similarity Matrix */}
        <AgreementMatrix data={similarityMatrix} />

        {/* Risk Analysis */}
        <RiskAnalysis data={riskData} />

        {/* Clause Explorer */}
        <ClauseExplorer clauses={allClauses as any[]} />
      </div>
    </>
  );
}
