"use client";

import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────

interface SimilarClause {
  title: string;
  agreementName: string;
  clauseType: string;
  summary: string;
  riskLevel: string;
  favorability: string;
  similarity: number;
}

interface Tier1Data {
  similarClauses: SimilarClause[];
  marketPosition: string;
  riskAssessment: string;
  avgSimilarity: number;
  riskDistribution: Record<string, number>;
  favorabilityDistribution: Record<string, number>;
  fetchedAt: number;
}

interface Tier2Data {
  commentary: string;
  marketAlignment: string;
  dominantRisk: string;
  dominantFavorability: string;
  fetchedAt: number;
}

export interface CachedIntelligence {
  tier1?: Tier1Data;
  tier2?: Tier2Data;
}

interface MarketIntelligencePanelProps {
  clauseId: Id<"clauses">;
  clauseTitle: string;
  clauseText: string;
  cachedIntelligence?: CachedIntelligence;
}

type LoadState = "idle" | "loading" | "loaded" | "error";

// ─── Helpers ──────────────────────────────────────────────────

function alignmentBadge(avgSim: number) {
  if (avgSim > 0.85)
    return { label: "Standard", color: "bg-green-100 text-green-800 border-green-300" };
  if (avgSim > 0.7)
    return { label: "Moderate", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  return { label: "Unique", color: "bg-red-100 text-red-800 border-red-300" };
}

function riskColor(level: string) {
  if (level === "low") return "bg-green-500";
  if (level === "medium") return "bg-yellow-500";
  return "bg-red-500";
}

function favColor(fav: string) {
  if (fav === "customer-favorable") return "bg-blue-500";
  if (fav === "neutral") return "bg-gray-400";
  return "bg-orange-500";
}

function riskBadgeStyle(level: string) {
  if (level === "low") return "bg-green-100 text-green-700";
  if (level === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

// ─── Component ────────────────────────────────────────────────

export function MarketIntelligencePanel({
  clauseId,
  clauseTitle,
  clauseText,
  cachedIntelligence,
}: MarketIntelligencePanelProps) {
  const [tier1, setTier1] = useState<Tier1Data | null>(cachedIntelligence?.tier1 ?? null);
  const [tier2, setTier2] = useState<Tier2Data | null>(cachedIntelligence?.tier2 ?? null);
  const [tier1State, setTier1State] = useState<LoadState>(cachedIntelligence?.tier1 ? "loaded" : "idle");
  const [tier2State, setTier2State] = useState<LoadState>(cachedIntelligence?.tier2 ? "loaded" : "idle");
  const [errorMsg, setErrorMsg] = useState("");

  const getClauseInsights = useAction(api.vectorDb.getClauseInsights);
  const getVectorCommentary = useAction(api.ai.getVectorCommentary);
  const updateMarketIntelligence = useMutation(api.clauses.updateMarketIntelligence);

  // ── Tier 1: statistical insights ──

  const loadTier1 = useCallback(async () => {
    if (tier1State === "loading") return;
    setTier1State("loading");
    setErrorMsg("");

    try {
      const result = await getClauseInsights({ clauseText });
      const data: Tier1Data = { ...result, fetchedAt: Date.now() };
      setTier1(data);
      setTier1State("loaded");

      // Cache on the clause record
      await updateMarketIntelligence({
        clauseId,
        marketIntelligence: { tier1: data, ...(tier2 ? { tier2 } : {}) },
      });
    } catch (err) {
      console.error("Tier 1 error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load insights");
      setTier1State("error");
    }
  }, [clauseText, clauseId, tier1State, tier2, getClauseInsights, updateMarketIntelligence]);

  // ── Tier 2: AI commentary ──

  const loadTier2 = useCallback(async () => {
    if (tier2State === "loading") return;
    setTier2State("loading");
    setErrorMsg("");

    try {
      const result = await getVectorCommentary({ clauseText, clauseTitle });

      if (!result.available) {
        setErrorMsg(result.message || "AI commentary unavailable");
        setTier2State("error");
        return;
      }

      const data: Tier2Data = {
        commentary: result.commentary,
        marketAlignment: result.marketAlignment,
        dominantRisk: result.dominantRisk,
        dominantFavorability: result.dominantFavorability,
        fetchedAt: Date.now(),
      };
      setTier2(data);
      setTier2State("loaded");

      // Merge into cache
      await updateMarketIntelligence({
        clauseId,
        marketIntelligence: { ...(tier1 ? { tier1 } : {}), tier2: data },
      });
    } catch (err) {
      console.error("Tier 2 error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load commentary");
      setTier2State("error");
    }
  }, [clauseText, clauseTitle, clauseId, tier1, tier2State, getVectorCommentary, updateMarketIntelligence]);

  // ── Auto-load Tier 1 on first render when not cached ──

  const [autoLoaded, setAutoLoaded] = useState(false);
  if (!autoLoaded && tier1State === "idle") {
    setAutoLoaded(true);
    // Fire in microtask to avoid updating state during render
    Promise.resolve().then(loadTier1);
  }

  // ── Render helpers ──

  const total = (dist: Record<string, number>) =>
    Object.values(dist).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="space-y-5">
      {/* ───── Tier 1: Statistical Insights ───── */}

      {tier1State === "loading" && (
        <div className="flex items-center gap-3 py-6 justify-center text-secondary/50">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Analysing market data…</span>
        </div>
      )}

      {tier1State === "error" && (
        <div className="p-4 bg-red-50 rounded-m border border-red-200">
          <p className="text-sm text-red-700">{errorMsg}</p>
          <Button variant="ghost" size="sm" onClick={loadTier1} className="mt-2 text-red-600">
            Retry
          </Button>
        </div>
      )}

      {tier1State === "loaded" && tier1 && (
        <>
          {/* Market alignment badge + avg similarity */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${alignmentBadge(tier1.avgSimilarity).color}`}
            >
              {alignmentBadge(tier1.avgSimilarity).label}
            </span>
            <span className="text-xs text-secondary/50">
              Avg. similarity: {(tier1.avgSimilarity * 100).toFixed(1)}%
            </span>
          </div>

          {/* Market position text */}
          <p className="text-sm text-secondary/80">{tier1.marketPosition}</p>

          {/* Risk distribution bar */}
          <div>
            <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-1.5">
              Risk Distribution
            </h5>
            <div className="flex h-3 rounded-full overflow-hidden bg-neutral-light">
              {(["low", "medium", "high"] as const).map((level) => {
                const count = tier1.riskDistribution[level] || 0;
                const pct = (count / total(tier1.riskDistribution)) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={level}
                    className={`${riskColor(level)} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${level}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {(["low", "medium", "high"] as const).map((level) => (
                <span key={level} className="text-[10px] text-secondary/50 capitalize">
                  {level} ({tier1.riskDistribution[level] || 0})
                </span>
              ))}
            </div>
          </div>

          {/* Favorability distribution bar */}
          <div>
            <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-1.5">
              Favorability Distribution
            </h5>
            <div className="flex h-3 rounded-full overflow-hidden bg-neutral-light">
              {(["customer-favorable", "neutral", "provider-favorable"] as const).map((fav) => {
                const count = tier1.favorabilityDistribution[fav] || 0;
                const pct = (count / total(tier1.favorabilityDistribution)) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={fav}
                    className={`${favColor(fav)} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${fav}: ${count}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              {(["customer-favorable", "neutral", "provider-favorable"] as const).map((fav) => (
                <span key={fav} className="text-[10px] text-secondary/50">
                  {fav === "customer-favorable" ? "Customer" : fav === "neutral" ? "Neutral" : "Provider"} ({tier1.favorabilityDistribution[fav] || 0})
                </span>
              ))}
            </div>
          </div>

          {/* Top similar clauses */}
          {tier1.similarClauses.length > 0 && (
            <div>
              <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider mb-2">
                Top Similar Clauses
              </h5>
              <div className="space-y-2">
                {tier1.similarClauses.slice(0, 5).map((sc, i) => (
                  <div
                    key={i}
                    className="p-3 bg-neutral-light/30 rounded-m border border-neutral-light flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary truncate">{sc.title}</p>
                      <p className="text-xs text-secondary/50 truncate">{sc.agreementName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskBadgeStyle(sc.riskLevel)}`}>
                        {sc.riskLevel}
                      </span>
                      <span className="text-xs text-secondary/40">
                        {(sc.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ───── Tier 2: AI Commentary ───── */}

      {tier1State === "loaded" && (
        <div className="pt-4 border-t border-neutral-light">
          {tier2State === "idle" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={loadTier2}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Get AI Commentary
            </Button>
          )}

          {tier2State === "loading" && (
            <div className="flex items-center gap-3 py-4 justify-center text-secondary/50">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Generating AI commentary…</span>
            </div>
          )}

          {tier2State === "error" && (
            <div className="p-4 bg-red-50 rounded-m border border-red-200">
              <p className="text-sm text-red-700">{errorMsg}</p>
              <Button variant="ghost" size="sm" onClick={loadTier2} className="mt-2 text-red-600">
                Retry
              </Button>
            </div>
          )}

          {tier2State === "loaded" && tier2 && (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-secondary/60 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                AI Market Commentary
              </h5>
              <blockquote className="pl-4 border-l-4 border-primary/30 text-sm text-secondary/80 italic">
                {tier2.commentary}
              </blockquote>
              <div className="flex gap-3 text-xs text-secondary/50">
                <span>Risk trend: <span className="font-medium text-secondary/70 capitalize">{tier2.dominantRisk}</span></span>
                <span>•</span>
                <span>Favorability: <span className="font-medium text-secondary/70">{tier2.dominantFavorability}</span></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
