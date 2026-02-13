"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const CLUSTER_COLORS = [
  "#6BAF8D", "#E8B730", "#D47070", "#5A9BD5", "#9B6BD5",
  "#D5A05A", "#5AD5A0", "#D55A9B", "#5AA0D5", "#A0D55A",
  "#D5895A", "#895AD5", "#5AD5D5", "#D5D55A", "#D55A78",
];

const RISK_COLORS: Record<string, string> = {
  low: "#6BAF8D",
  medium: "#E8B730",
  high: "#D47070",
};

const FAV_COLORS: Record<string, string> = {
  "provider-favorable": "#D47070",
  neutral: "#E8B730",
  "customer-favorable": "#6BAF8D",
};

interface ClausePoint {
  _id: string;
  agreementName: string;
  clauseType: string;
  title: string;
  summary: string;
  riskLevel: string;
  favorability: string;
  x: number | undefined;
  y: number | undefined;
  clusterId: number | undefined;
  isOutlier: boolean | undefined;
}

interface SimilarityMapProps {
  clauses: ClausePoint[];
}

type ColorMode = "cluster" | "risk" | "favorability" | "agreement";

export function SimilarityMap({ clauses }: SimilarityMapProps) {
  const [colorMode, setColorMode] = useState<ColorMode>("cluster");
  const [hoveredPoint, setHoveredPoint] = useState<ClausePoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<ClausePoint | null>(null);

  // Filter to clauses that have coordinates
  const validClauses = useMemo(
    () => clauses.filter((c) => c.x !== undefined && c.y !== undefined),
    [clauses]
  );

  // Unique agreement names for coloring
  const agreementNames = useMemo(
    () => [...new Set(validClauses.map((c) => c.agreementName))],
    [validClauses]
  );

  const getColor = (clause: ClausePoint): string => {
    switch (colorMode) {
      case "cluster":
        return CLUSTER_COLORS[(clause.clusterId ?? 0) % CLUSTER_COLORS.length];
      case "risk":
        return RISK_COLORS[clause.riskLevel] || "#999";
      case "favorability":
        return FAV_COLORS[clause.favorability] || "#999";
      case "agreement":
        const idx = agreementNames.indexOf(clause.agreementName);
        return CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
      default:
        return "#999";
    }
  };

  // SVG dimensions
  const width = 600;
  const height = 420;
  const padding = 40;

  const toSvgX = (x: number) =>
    padding + ((x + 1) / 2) * (width - 2 * padding);
  const toSvgY = (y: number) =>
    padding + ((1 - (y + 1) / 2)) * (height - 2 * padding);

  const activePoint = hoveredPoint || selectedPoint;

  return (
    <div className="bg-white rounded-card shadow-subtle p-6 border-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-heading font-extrabold text-secondary">
            Clause Similarity Map
          </h3>
          <p className="text-sm text-secondary/50 font-body mt-1">
            Each point represents a clause. Proximity = semantic similarity.
          </p>
        </div>
        <div className="flex gap-2">
          {(["cluster", "risk", "favorability", "agreement"] as const).map(
            (mode) => (
              <button
                key={mode}
                onClick={() => setColorMode(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-pill text-xs font-bold font-body transition-all",
                  colorMode === mode
                    ? "bg-secondary text-white"
                    : "bg-neutral-light text-secondary/60 hover:bg-neutral-medium/30"
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full border border-neutral-light/50 rounded-m bg-neutral/30"
        >
          {/* Grid lines */}
          <line x1={width / 2} y1={padding} x2={width / 2} y2={height - padding} stroke="#e5e5e5" strokeWidth="1" strokeDasharray="4,4" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e5e5" strokeWidth="1" strokeDasharray="4,4" />

          {/* Points */}
          {validClauses.map((clause) => {
            const cx = toSvgX(clause.x!);
            const cy = toSvgY(clause.y!);
            const isActive = activePoint?._id === clause._id;
            const isOutlier = clause.isOutlier;

            return (
              <g key={clause._id}>
                {isOutlier && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 12 : 9}
                    fill="none"
                    stroke="#D47070"
                    strokeWidth="2"
                    strokeDasharray="3,2"
                    opacity={0.6}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 8 : 5}
                  fill={getColor(clause)}
                  stroke={isActive ? "#1A1A1A" : "white"}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={activePoint && !isActive ? 0.3 : 0.85}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(clause)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() =>
                    setSelectedPoint(
                      selectedPoint?._id === clause._id ? null : clause
                    )
                  }
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {activePoint && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-m shadow-subtle border border-neutral-light/50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-secondary text-sm truncate">
                  {activePoint.title}
                </p>
                <p className="text-xs text-secondary/50 font-body mt-0.5">
                  {activePoint.agreementName}
                </p>
                <p className="text-xs text-secondary/70 font-body mt-2 line-clamp-2">
                  {activePoint.summary}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs font-bold bg-neutral-light text-secondary/60 px-2 py-1 rounded-pill">
                  {activePoint.clauseType}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-pill",
                    activePoint.riskLevel === "high"
                      ? "bg-accent-error/10 text-accent-error"
                      : activePoint.riskLevel === "medium"
                        ? "bg-primary-yellow/20 text-secondary"
                        : "bg-accent-success/10 text-accent-success"
                  )}
                >
                  {activePoint.riskLevel} risk
                </span>
                {activePoint.isOutlier && (
                  <span className="text-xs font-bold bg-accent-error/10 text-accent-error px-2 py-1 rounded-pill">
                    Outlier
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {colorMode === "cluster" &&
          [...new Set(validClauses.map((c) => c.clusterId))]
            .filter((id) => id !== undefined)
            .sort((a, b) => (a ?? 0) - (b ?? 0))
            .map((clusterId) => (
              <div key={clusterId} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      CLUSTER_COLORS[(clusterId ?? 0) % CLUSTER_COLORS.length],
                  }}
                />
                <span className="text-xs text-secondary/50 font-body">
                  Cluster {(clusterId ?? 0) + 1}
                </span>
              </div>
            ))}
        {colorMode === "risk" &&
          Object.entries(RISK_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-secondary/50 font-body capitalize">
                {level}
              </span>
            </div>
          ))}
        {colorMode === "favorability" &&
          Object.entries(FAV_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-secondary/50 font-body capitalize">
                {level}
              </span>
            </div>
          ))}
        {colorMode === "agreement" &&
          agreementNames.map((name, i) => (
            <div key={name} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
                }}
              />
              <span className="text-xs text-secondary/50 font-body truncate max-w-[120px]">
                {name}
              </span>
            </div>
          ))}
        <div className="flex items-center gap-1.5 ml-2">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-red-400" />
          <span className="text-xs text-secondary/50 font-body">Outlier</span>
        </div>
      </div>
    </div>
  );
}
