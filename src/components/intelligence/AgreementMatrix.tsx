"use client";

import { useState } from "react";

interface AgreementMatrixProps {
  data: {
    matrix: number[][];
    labels: string[];
    providers: string[];
  } | null;
}

function getHeatmapColor(value: number): string {
  // Gradient from light (low similarity) to dark green (high similarity)
  if (value >= 0.95) return "#2D6A4F";
  if (value >= 0.85) return "#40916C";
  if (value >= 0.75) return "#52B788";
  if (value >= 0.65) return "#74C69D";
  if (value >= 0.55) return "#95D5B2";
  if (value >= 0.45) return "#B7E4C7";
  if (value >= 0.35) return "#D8F3DC";
  return "#F0FAF4";
}

export function AgreementMatrix({ data }: AgreementMatrixProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    i: number;
    j: number;
  } | null>(null);

  if (!data || !data.matrix.length) {
    return (
      <div className="bg-white rounded-card shadow-subtle p-6 border-none">
        <h3 className="text-xl font-heading font-extrabold text-secondary mb-2">
          Agreement Similarity Matrix
        </h3>
        <p className="text-secondary/50 font-body text-sm">
          Run analysis to see agreement similarities.
        </p>
      </div>
    );
  }

  const { matrix, labels } = data;
  const n = labels.length;

  // Short labels for display
  const shortLabels = labels.map((l) => {
    if (l.length > 18) return l.slice(0, 16) + "...";
    return l;
  });

  return (
    <div className="bg-white rounded-card shadow-subtle p-6 border-none">
      <div className="mb-4">
        <h3 className="text-xl font-heading font-extrabold text-secondary">
          Agreement Similarity Matrix
        </h3>
        <p className="text-sm text-secondary/50 font-body mt-1">
          Cosine similarity between agreement embeddings. Darker = more similar.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Column headers */}
          <div className="flex">
            <div className="w-40 shrink-0" />
            {shortLabels.map((label, j) => (
              <div
                key={j}
                className="w-14 h-28 flex items-end justify-center pb-2 shrink-0"
              >
                <span
                  className="text-xs font-body text-secondary/60 font-medium whitespace-nowrap origin-bottom-left -rotate-45 translate-x-3"
                  title={labels[j]}
                >
                  {shortLabels[j]}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center">
              <div
                className="w-40 pr-3 text-right shrink-0 truncate"
                title={labels[i]}
              >
                <span className="text-xs font-body text-secondary/70 font-medium">
                  {shortLabels[i]}
                </span>
              </div>
              {row.map((value, j) => {
                const isHovered =
                  hoveredCell?.i === i && hoveredCell?.j === j;
                const isDiagonal = i === j;

                return (
                  <div
                    key={j}
                    className="w-14 h-10 flex items-center justify-center shrink-0 border border-white/50 relative cursor-pointer transition-all"
                    style={{
                      backgroundColor: isDiagonal
                        ? "#1A1A1A"
                        : getHeatmapColor(value),
                    }}
                    onMouseEnter={() => setHoveredCell({ i, j })}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    <span
                      className={`text-xs font-bold font-body ${
                        isDiagonal || value >= 0.85
                          ? "text-white"
                          : "text-secondary/70"
                      }`}
                    >
                      {isDiagonal ? "1.0" : value.toFixed(2)}
                    </span>

                    {isHovered && !isDiagonal && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-secondary text-white rounded-s px-3 py-2 text-xs font-body whitespace-nowrap z-20 shadow-lg">
                        <p className="font-bold">{(value * 100).toFixed(1)}% similar</p>
                        <p className="opacity-70 text-[10px] mt-0.5">
                          {labels[i]} vs {labels[j]}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-secondary/50 font-body">Less similar</span>
        <div className="flex h-3 rounded-full overflow-hidden flex-1 max-w-xs">
          {["#F0FAF4", "#D8F3DC", "#B7E4C7", "#95D5B2", "#74C69D", "#52B788", "#40916C", "#2D6A4F"].map(
            (color) => (
              <div key={color} className="flex-1" style={{ backgroundColor: color }} />
            )
          )}
        </div>
        <span className="text-xs text-secondary/50 font-body">More similar</span>
      </div>
    </div>
  );
}
