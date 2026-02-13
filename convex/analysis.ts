import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type AgreementDoc = Doc<"agreements">;
type ClauseDoc = Doc<"agreementClauses">;

interface AnalysisOutput {
  clausesAnalyzed: number;
  agreementsAnalyzed: number;
  clustersFound: number;
  outliersDetected: number;
  insightsGenerated: number;
}

interface OutlierDetail {
  title: string;
  agreementName: string;
  clauseType: string;
  outlierScore: number;
  isOutlier: boolean;
}

interface ClusterSummary {
  clusterId: number;
  size: number;
  dominantType: string;
  agreements: string[];
  avgRisk: string;
  types: Record<string, number>;
  sampleTitles?: string[];
}

interface Insight {
  type: string;
  title: string;
  description: string;
  importance: string;
}

// ═══════════════════════════════════════════════════════════════
// Math Helpers
// ═══════════════════════════════════════════════════════════════

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// K-Means clustering
function kMeans(
  vectors: number[][],
  k: number,
  maxIter = 50
): { assignments: number[]; centroids: number[][] } {
  const n = vectors.length;
  if (n === 0) return { assignments: [], centroids: [] };
  if (n <= k) {
    return {
      assignments: vectors.map((_: number[], i: number) => i),
      centroids: vectors.map((v: number[]) => [...v]),
    };
  }

  const d = vectors[0].length;

  // Initialize centroids using k-means++ strategy
  const centroidIndices: number[] = [Math.floor(Math.random() * n)];
  while (centroidIndices.length < k) {
    const distances: number[] = vectors.map((v: number[], i: number) => {
      if (centroidIndices.includes(i)) return 0;
      let minDist = Infinity;
      for (const ci of centroidIndices) {
        const dist = euclideanDistance(v, vectors[ci]);
        if (dist < minDist) minDist = dist;
      }
      return minDist * minDist;
    });
    const totalDist = distances.reduce((a: number, b: number) => a + b, 0);
    let r = Math.random() * totalDist;
    let found = false;
    for (let i = 0; i < n; i++) {
      r -= distances[i];
      if (r <= 0) {
        centroidIndices.push(i);
        found = true;
        break;
      }
    }
    if (!found) {
      centroidIndices.push(Math.floor(Math.random() * n));
    }
  }

  let centroids = centroidIndices.map((i: number) => [...vectors[i]]);
  let assignments: number[] = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign to nearest centroid (using cosine similarity)
    const newAssignments: number[] = vectors.map((v: number[]) => {
      let bestSim = -Infinity;
      let bestK = 0;
      for (let j = 0; j < k; j++) {
        const sim = cosineSimilarity(v, centroids[j]);
        if (sim > bestSim) {
          bestSim = sim;
          bestK = j;
        }
      }
      return bestK;
    });

    // Check convergence
    if (newAssignments.every((a: number, i: number) => a === assignments[i]))
      break;
    assignments = newAssignments;

    // Update centroids
    centroids = Array.from({ length: k }, (_: unknown, j: number) => {
      const memberIndices: number[] = assignments
        .map((a: number, i: number) => (a === j ? i : -1))
        .filter((i: number) => i >= 0);
      if (memberIndices.length === 0) return centroids[j];
      const newCentroid = new Array(d).fill(0) as number[];
      for (const mi of memberIndices) {
        for (let dim = 0; dim < d; dim++) {
          newCentroid[dim] += vectors[mi][dim];
        }
      }
      for (let dim = 0; dim < d; dim++) {
        newCentroid[dim] /= memberIndices.length;
      }
      return newCentroid;
    });
  }

  return { assignments, centroids };
}

// PCA via Gram matrix for 2D projection
function pca2D(vectors: number[][]): { x: number[]; y: number[] } {
  const n = vectors.length;
  if (n === 0) return { x: [], y: [] };
  if (n === 1) return { x: [0], y: [0] };

  const d = vectors[0].length;

  // Compute mean
  const mean = new Array(d).fill(0) as number[];
  for (const v of vectors) {
    for (let i = 0; i < d; i++) mean[i] += v[i];
  }
  for (let i = 0; i < d; i++) mean[i] /= n;

  // Center data
  const centered: number[][] = vectors.map((v: number[]) =>
    v.map((x: number, i: number) => x - mean[i])
  );

  // Compute Gram matrix K = X * X^T (NxN)
  const K: number[][] = Array.from({ length: n }, () =>
    new Array(n).fill(0) as number[]
  );
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      let dot = 0;
      for (let k = 0; k < d; k++) dot += centered[i][k] * centered[j][k];
      K[i][j] = dot;
      K[j][i] = dot;
    }
  }

  // Power iteration for top eigenvector
  const eigen1 = powerIteration(K, n);

  // Deflate matrix
  const K2: number[][] = K.map((row: number[]) => [...row]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      K2[i][j] -= eigen1.value * eigen1.vector[i] * eigen1.vector[j];
    }
  }

  // Second eigenvector
  const eigen2 = powerIteration(K2, n);

  // Project to 2D and normalize to [-1, 1] range
  const scale1 = Math.sqrt(Math.abs(eigen1.value));
  const scale2 = Math.sqrt(Math.abs(eigen2.value));

  const rawX: number[] = eigen1.vector.map((v: number) => v * scale1);
  const rawY: number[] = eigen2.vector.map((v: number) => v * scale2);

  // Normalize to [-1, 1]
  const maxAbsX = Math.max(...rawX.map(Math.abs), 1e-10);
  const maxAbsY = Math.max(...rawY.map(Math.abs), 1e-10);

  return {
    x: rawX.map((v: number) => v / maxAbsX),
    y: rawY.map((v: number) => v / maxAbsY),
  };
}

function powerIteration(
  matrix: number[][],
  n: number,
  maxIter = 200
): { vector: number[]; value: number } {
  let v: number[] = Array.from({ length: n }, () => Math.random() - 0.5);
  let norm = Math.sqrt(v.reduce((s: number, x: number) => s + x * x, 0));
  v = v.map((x: number) => x / norm);

  let eigenvalue = 0;
  for (let iter = 0; iter < maxIter; iter++) {
    const Mv = new Array(n).fill(0) as number[];
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Mv[i] += matrix[i][j] * v[j];
      }
    }

    eigenvalue = Mv.reduce(
      (s: number, x: number, i: number) => s + x * v[i],
      0
    );

    norm = Math.sqrt(Mv.reduce((s: number, x: number) => s + x * x, 0));
    if (norm < 1e-10) break;
    v = Mv.map((x: number) => x / norm);
  }

  return { vector: v, value: eigenvalue };
}

// ═══════════════════════════════════════════════════════════════
// Analysis Action: Compute clusters, outliers, coordinates, insights
// ═══════════════════════════════════════════════════════════════

export const runFullAnalysis = action({
  args: {},
  handler: async (ctx): Promise<AnalysisOutput> => {
    console.log("Starting full vector analysis...");

    // Fetch all data
    const agreements: AgreementDoc[] = await ctx.runQuery(
      internal.vectorDb.getAllAgreementsInternal,
      {}
    );
    const clauses: ClauseDoc[] = await ctx.runQuery(
      internal.vectorDb.getAllClausesInternal,
      {}
    );

    if (clauses.length === 0) {
      throw new Error("No clauses found in the database. Run seeding first.");
    }

    console.log(
      `Analyzing ${agreements.length} agreements with ${clauses.length} clauses...`
    );

    // ─── 1. Clause clustering ───
    console.log("  Computing clause clusters...");
    const clauseEmbeddings: number[][] = clauses.map(
      (c: ClauseDoc) => c.embedding
    );
    const k = Math.min(
      Math.max(Math.round(Math.sqrt(clauses.length / 2)), 5),
      15
    );
    const { assignments, centroids } = kMeans(clauseEmbeddings, k);

    // ─── 2. Outlier detection ───
    console.log("  Detecting outliers...");
    const outlierScores: number[] = clauses.map(
      (clause: ClauseDoc, i: number) => {
        const centroid = centroids[assignments[i]];
        return 1 - cosineSimilarity(clause.embedding, centroid);
      }
    );

    const meanScore: number =
      outlierScores.reduce((a: number, b: number) => a + b, 0) /
      outlierScores.length;
    const stdScore: number = Math.sqrt(
      outlierScores.reduce(
        (s: number, x: number) => s + (x - meanScore) ** 2,
        0
      ) / outlierScores.length
    );
    const outlierThreshold = meanScore + 1.5 * stdScore;
    const isOutlier: boolean[] = outlierScores.map(
      (s: number) => s > outlierThreshold
    );

    // ─── 3. PCA 2D projection for clauses ───
    console.log("  Computing 2D projections for clauses...");
    const clauseCoords = pca2D(clauseEmbeddings);

    // ─── 4. PCA 2D projection for agreements ───
    console.log("  Computing 2D projections for agreements...");
    const agreementEmbeddings: number[][] = agreements.map(
      (a: AgreementDoc) => a.embedding
    );
    const agreementCoords = pca2D(agreementEmbeddings);

    // ─── 5. Agreement similarity matrix ───
    console.log("  Computing agreement similarity matrix...");
    const agreementSimilarityMatrix: number[][] = [];
    for (let i = 0; i < agreements.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < agreements.length; j++) {
        row.push(
          cosineSimilarity(agreements[i].embedding, agreements[j].embedding)
        );
      }
      agreementSimilarityMatrix.push(row);
    }

    // ─── 6. Cluster summaries ───
    console.log("  Generating cluster summaries...");
    const clusterSummaries: ClusterSummary[] = Array.from(
      { length: k },
      (_: unknown, clusterId: number) => {
        const memberIndices: number[] = assignments
          .map((a: number, i: number) => (a === clusterId ? i : -1))
          .filter((i: number) => i >= 0);

        if (memberIndices.length === 0) {
          return {
            clusterId,
            size: 0,
            dominantType: "N/A",
            agreements: [],
            avgRisk: "N/A",
            types: {},
          };
        }

        const members: ClauseDoc[] = memberIndices.map(
          (i: number) => clauses[i]
        );

        const typeCounts: Record<string, number> = {};
        const agreementNames = new Set<string>();
        const riskCounts: Record<string, number> = {
          low: 0,
          medium: 0,
          high: 0,
        };

        for (const member of members) {
          typeCounts[member.clauseType] =
            (typeCounts[member.clauseType] || 0) + 1;
          agreementNames.add(member.agreementName);
          if (member.riskLevel in riskCounts) {
            riskCounts[member.riskLevel]++;
          }
        }

        const dominantType = Object.entries(typeCounts).sort(
          ([, a]: [string, number], [, b]: [string, number]) => b - a
        )[0][0];
        const avgRisk = Object.entries(riskCounts).sort(
          ([, a]: [string, number], [, b]: [string, number]) => b - a
        )[0][0];

        return {
          clusterId,
          size: members.length,
          dominantType,
          agreements: Array.from(agreementNames),
          avgRisk,
          types: typeCounts,
          sampleTitles: members.slice(0, 5).map((m: ClauseDoc) => m.title),
        };
      }
    );

    // ─── 7. Key findings ───
    console.log("  Generating key findings...");

    // Find most similar agreement pair
    let maxSim = 0;
    let mostSimilarPair: [string, string] = ["", ""];
    for (let i = 0; i < agreements.length; i++) {
      for (let j = i + 1; j < agreements.length; j++) {
        if (agreementSimilarityMatrix[i][j] > maxSim) {
          maxSim = agreementSimilarityMatrix[i][j];
          mostSimilarPair = [agreements[i].name, agreements[j].name];
        }
      }
    }

    // Find most unique agreement
    const avgSimilarities: number[] = agreements.map(
      (_: AgreementDoc, i: number) => {
        let sum = 0;
        for (let j = 0; j < agreements.length; j++) {
          if (i !== j) sum += agreementSimilarityMatrix[i][j];
        }
        return sum / (agreements.length - 1);
      }
    );
    const mostUniqueIdx = avgSimilarities.indexOf(
      Math.min(...avgSimilarities)
    );

    // Find most common clause types
    const globalTypeCounts: Record<string, number> = {};
    for (const clause of clauses) {
      globalTypeCounts[clause.clauseType] =
        (globalTypeCounts[clause.clauseType] || 0) + 1;
    }
    const sortedTypes: [string, number][] = Object.entries(
      globalTypeCounts
    ).sort(
      ([, a]: [string, number], [, b]: [string, number]) => b - a
    );

    // Risk analysis
    const highRiskClauses: ClauseDoc[] = clauses.filter(
      (c: ClauseDoc) => c.riskLevel === "high"
    );
    const providerFavorable: ClauseDoc[] = clauses.filter(
      (c: ClauseDoc) => c.favorability === "provider-favorable"
    );

    // Outlier details
    const outlierDetails: OutlierDetail[] = clauses
      .map((c: ClauseDoc, i: number) => ({
        title: c.title,
        agreementName: c.agreementName,
        clauseType: c.clauseType,
        outlierScore: outlierScores[i],
        isOutlier: isOutlier[i],
      }))
      .filter((o: OutlierDetail) => o.isOutlier)
      .sort(
        (a: OutlierDetail, b: OutlierDetail) =>
          b.outlierScore - a.outlierScore
      );

    const insights: Insight[] = [
      {
        type: "similarity",
        title: "Most Similar Agreements",
        description: `${mostSimilarPair[0]} and ${mostSimilarPair[1]} are the most similar pair with ${(maxSim * 100).toFixed(1)}% cosine similarity.`,
        importance: "high",
      },
      {
        type: "uniqueness",
        title: "Most Unique Agreement",
        description: `${agreements[mostUniqueIdx]?.name} is the most unique agreement with an average similarity of ${(avgSimilarities[mostUniqueIdx] * 100).toFixed(1)}% to other agreements.`,
        importance: "high",
      },
      {
        type: "risk",
        title: "Risk Landscape",
        description: `${highRiskClauses.length} out of ${clauses.length} clauses (${((highRiskClauses.length / clauses.length) * 100).toFixed(0)}%) are rated high risk. ${providerFavorable.length} clauses (${((providerFavorable.length / clauses.length) * 100).toFixed(0)}%) favor the provider.`,
        importance: "medium",
      },
      {
        type: "coverage",
        title: "Clause Coverage",
        description: `The most common clause types are: ${sortedTypes
          .slice(0, 5)
          .map(([type, count]: [string, number]) => `${type} (${count})`)
          .join(", ")}. ${sortedTypes.length} unique clause types found across all agreements.`,
        importance: "medium",
      },
      {
        type: "outliers",
        title: "Unusual Clauses",
        description:
          outlierDetails.length > 0
            ? `${outlierDetails.length} outlier clauses detected. Most unusual: "${outlierDetails[0]?.title}" from ${outlierDetails[0]?.agreementName}.`
            : "No significant outliers detected - all clauses align well with their clusters.",
        importance: "high",
      },
      {
        type: "clusters",
        title: "Clause Groupings",
        description: `${k} natural clusters found. Largest cluster has ${Math.max(...clusterSummaries.map((c: ClusterSummary) => c.size))} clauses, dominated by "${clusterSummaries.sort((a: ClusterSummary, b: ClusterSummary) => b.size - a.size)[0]?.dominantType}" type.`,
        importance: "medium",
      },
    ];

    // ─── 8. Update database ───
    console.log("  Updating clause analysis data...");

    for (let i = 0; i < clauses.length; i++) {
      await ctx.runMutation(internal.vectorDb.updateClauseAnalysis, {
        id: clauses[i]._id,
        x: clauseCoords.x[i],
        y: clauseCoords.y[i],
        clusterId: assignments[i],
        isOutlier: isOutlier[i],
      });
    }

    for (let i = 0; i < agreements.length; i++) {
      await ctx.runMutation(internal.vectorDb.updateAgreementCoordinates, {
        id: agreements[i]._id,
        x: agreementCoords.x[i],
        y: agreementCoords.y[i],
      });
    }

    // Store analysis results
    console.log("  Storing analysis results...");

    await ctx.runMutation(internal.vectorDb.storeAnalysisResult, {
      analysisType: "clusters",
      title: "Clause Clusters",
      description: `${k} clusters identified across ${clauses.length} clauses`,
      data: { clusters: clusterSummaries, k },
    });

    await ctx.runMutation(internal.vectorDb.storeAnalysisResult, {
      analysisType: "similarity_matrix",
      title: "Agreement Similarity Matrix",
      description: `Pairwise cosine similarity between ${agreements.length} agreements`,
      data: {
        matrix: agreementSimilarityMatrix,
        labels: agreements.map((a: AgreementDoc) => a.name),
        providers: agreements.map((a: AgreementDoc) => a.provider),
      },
    });

    await ctx.runMutation(internal.vectorDb.storeAnalysisResult, {
      analysisType: "outliers",
      title: "Outlier Analysis",
      description: `${outlierDetails.length} unusual clauses identified`,
      data: {
        outliers: outlierDetails,
        threshold: outlierThreshold,
        meanScore,
        stdScore,
      },
    });

    await ctx.runMutation(internal.vectorDb.storeAnalysisResult, {
      analysisType: "insights",
      title: "Key Insights",
      description: "AI-generated insights from agreement analysis",
      data: { insights },
    });

    await ctx.runMutation(internal.vectorDb.storeAnalysisResult, {
      analysisType: "risk_analysis",
      title: "Risk Analysis",
      description: "Risk distribution across agreements and clause types",
      data: {
        highRiskByAgreement: agreements.map((a: AgreementDoc) => ({
          name: a.name,
          provider: a.provider,
          highRiskCount: clauses.filter(
            (c: ClauseDoc) =>
              c.agreementId === a._id && c.riskLevel === "high"
          ).length,
          totalClauses: clauses.filter(
            (c: ClauseDoc) => c.agreementId === a._id
          ).length,
        })),
        highRiskByType: Object.entries(
          highRiskClauses.reduce(
            (acc: Record<string, number>, c: ClauseDoc) => {
              acc[c.clauseType] = (acc[c.clauseType] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        )
          .sort(
            ([, a]: [string, number], [, b]: [string, number]) => b - a
          )
          .map(([type, count]: [string, number]) => ({ type, count })),
        providerFavorableByAgreement: agreements.map((a: AgreementDoc) => ({
          name: a.name,
          count: clauses.filter(
            (c: ClauseDoc) =>
              c.agreementId === a._id &&
              c.favorability === "provider-favorable"
          ).length,
        })),
      },
    });

    console.log("Full analysis complete!");

    return {
      clausesAnalyzed: clauses.length,
      agreementsAnalyzed: agreements.length,
      clustersFound: k,
      outliersDetected: outlierDetails.length,
      insightsGenerated: insights.length,
    };
  },
});
