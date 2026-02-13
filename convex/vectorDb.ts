import { v } from "convex/values";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface ExtractedClauseForVector {
  title: string;
  clauseType: string;
  text: string;
  summary: string;
  riskLevel: string;
  favorability: string;
}

interface ClaudeExtractionResponse {
  provider: string;
  documentType: string;
  clauses: ExtractedClauseForVector[];
}

// ═══════════════════════════════════════════════════════════════
// Helper: Generate embeddings via Voyage AI (voyage-law-2 for legal text)
// ═══════════════════════════════════════════════════════════════

async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  // Voyage AI supports up to 1000 texts but has a 120K token limit for voyage-law-2
  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    // Truncate each text to ~16000 tokens (~64000 chars) for voyage-law-2 context window
    const truncated = batch.map((t) =>
      t.length > 64000 ? t.slice(0, 64000) : t
    );

    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "voyage-law-2",
        input: truncated,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voyage AI Embeddings API error: ${error}`);
    }

    const data = await response.json();
    // Sort by index to ensure correct order
    const sorted = data.data.sort(
      (a: { index: number }, b: { index: number }) => a.index - b.index
    );
    allEmbeddings.push(...sorted.map((item: any) => item.embedding));
  }

  return allEmbeddings;
}

// ═══════════════════════════════════════════════════════════════
// Helper: Extract clauses via Claude
// ═══════════════════════════════════════════════════════════════

async function extractClausesForVector(
  documentText: string,
  apiKey: string
): Promise<ClaudeExtractionResponse> {
  const systemPrompt = `You are a legal document analyzer specializing in SaaS and cloud service agreements. Analyze the agreement and extract individual clauses with detailed metadata.

For each clause, provide:
1. title: A descriptive title for the clause
2. clauseType: One of: "Definitions", "License Grant", "Restrictions", "Fees and Payment", "Term and Renewal", "Termination", "Data Protection", "Confidentiality", "Intellectual Property", "Warranty", "Limitation of Liability", "Indemnification", "Service Level", "Support", "Compliance", "Governing Law", "Dispute Resolution", "Force Majeure", "Assignment", "Notices", "Amendments", "Entire Agreement", "Severability", "Insurance", "Audit Rights", "Acceptable Use", "Other"
3. text: The relevant clause text (summarize if very long, but capture ALL key provisions faithfully)
4. summary: A 2-3 sentence summary of the clause's key provisions
5. riskLevel: Risk assessment for the CUSTOMER ("low", "medium", "high")
6. favorability: Who the clause favors ("provider-favorable", "neutral", "customer-favorable")

Also identify:
- provider: The SaaS provider name
- documentType: The type of agreement (e.g., "SaaS Agreement", "Cloud Services Agreement", "Terms of Service", "Master Service Agreement")

Respond with ONLY valid JSON (no markdown code blocks) in this exact format:
{
  "provider": "Provider Name",
  "documentType": "Agreement Type",
  "clauses": [
    {
      "title": "...",
      "clauseType": "...",
      "text": "...",
      "summary": "...",
      "riskLevel": "...",
      "favorability": "..."
    }
  ]
}

Focus on substantive legal clauses. Extract 10-25 key clauses per agreement.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze this legal agreement and extract clauses. Respond with only valid JSON:\n\n${documentText.slice(0, 100000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error("No response from Claude");

  // Parse JSON response
  let jsonContent = content.trim();
  if (jsonContent.startsWith("```json")) jsonContent = jsonContent.slice(7);
  else if (jsonContent.startsWith("```")) jsonContent = jsonContent.slice(3);
  if (jsonContent.endsWith("```")) jsonContent = jsonContent.slice(0, -3);
  jsonContent = jsonContent.trim();

  const parsed: ClaudeExtractionResponse = JSON.parse(jsonContent);
  if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
    throw new Error("Invalid response format - missing clauses array");
  }

  return parsed;
}

// ═══════════════════════════════════════════════════════════════
// Internal Mutations: Store data
// ═══════════════════════════════════════════════════════════════

export const storeAgreement = internalMutation({
  args: {
    name: v.string(),
    provider: v.string(),
    sourceFile: v.string(),
    fullText: v.string(),
    clauseCount: v.number(),
    wordCount: v.number(),
    documentType: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agreements", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const storeAgreementClause = internalMutation({
  args: {
    agreementId: v.id("agreements"),
    agreementName: v.string(),
    clauseType: v.string(),
    title: v.string(),
    text: v.string(),
    summary: v.string(),
    riskLevel: v.string(),
    favorability: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agreementClauses", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const storeAnalysisResult = internalMutation({
  args: {
    analysisType: v.string(),
    title: v.string(),
    description: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analysisResults", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateClauseAnalysis = internalMutation({
  args: {
    id: v.id("agreementClauses"),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    clusterId: v.optional(v.number()),
    isOutlier: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const updateAgreementCoordinates = internalMutation({
  args: {
    id: v.id("agreements"),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { x: args.x, y: args.y });
  },
});

// ═══════════════════════════════════════════════════════════════
// Internal Queries: Fetch data for analysis
// ═══════════════════════════════════════════════════════════════

export const getAllAgreementsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agreements").collect();
  },
});

export const getAllClausesInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agreementClauses").collect();
  },
});

export const getClausesByIds = internalQuery({
  args: { ids: v.array(v.id("agreementClauses")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) results.push(doc);
    }
    return results;
  },
});

export const getAgreementsByIds = internalQuery({
  args: { ids: v.array(v.id("agreements")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) results.push(doc);
    }
    return results;
  },
});

// ═══════════════════════════════════════════════════════════════
// Public Queries: Read data for frontend
// ═══════════════════════════════════════════════════════════════

// List all agreements
export const listAgreements = query({
  args: {},
  handler: async (ctx) => {
    const agreements = await ctx.db.query("agreements").collect();
    // Return without the full text and embedding for performance
    return agreements.map((a) => ({
      _id: a._id,
      name: a.name,
      provider: a.provider,
      sourceFile: a.sourceFile,
      clauseCount: a.clauseCount,
      wordCount: a.wordCount,
      documentType: a.documentType,
      x: a.x,
      y: a.y,
      createdAt: a.createdAt,
    }));
  },
});

// Get a single agreement with full details
export const getAgreement = query({
  args: { id: v.id("agreements") },
  handler: async (ctx, args) => {
    const agreement = await ctx.db.get(args.id);
    if (!agreement) return null;
    // Omit embedding from response
    const { embedding, ...rest } = agreement;
    return rest;
  },
});

// List clauses for an agreement
export const listClausesByAgreement = query({
  args: { agreementId: v.id("agreements") },
  handler: async (ctx, args) => {
    const clauses = await ctx.db
      .query("agreementClauses")
      .withIndex("by_agreement", (q) => q.eq("agreementId", args.agreementId))
      .collect();
    // Omit embeddings for performance
    return clauses.map((c) => {
      const { embedding, ...rest } = c;
      return rest;
    });
  },
});

// Get all clauses (for visualization and explorer)
export const listAllClauses = query({
  args: {},
  handler: async (ctx) => {
    const clauses = await ctx.db.query("agreementClauses").collect();
    return clauses.map((c) => ({
      _id: c._id,
      agreementId: c.agreementId,
      agreementName: c.agreementName,
      clauseType: c.clauseType,
      title: c.title,
      text: c.text,
      summary: c.summary,
      riskLevel: c.riskLevel,
      favorability: c.favorability,
      x: c.x,
      y: c.y,
      clusterId: c.clusterId,
      isOutlier: c.isOutlier,
    }));
  },
});

// Get clauses by type across all agreements
export const listClausesByType = query({
  args: { clauseType: v.string() },
  handler: async (ctx, args) => {
    const clauses = await ctx.db
      .query("agreementClauses")
      .withIndex("by_type", (q) => q.eq("clauseType", args.clauseType))
      .collect();
    return clauses.map((c) => {
      const { embedding, ...rest } = c;
      return rest;
    });
  },
});

// Get analysis results
export const getAnalysisResults = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("analysisResults").collect();
  },
});

// Get analysis by type
export const getAnalysisByType = query({
  args: { analysisType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysisResults")
      .withIndex("by_type", (q) => q.eq("analysisType", args.analysisType))
      .collect();
  },
});

// Get overview stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const agreements = await ctx.db.query("agreements").collect();
    const clauses = await ctx.db.query("agreementClauses").collect();
    const analysisResults = await ctx.db.query("analysisResults").collect();

    // Compute stats
    const clauseTypes = new Map<string, number>();
    const riskDistribution = { low: 0, medium: 0, high: 0 };
    const favorabilityDistribution = {
      "provider-favorable": 0,
      neutral: 0,
      "customer-favorable": 0,
    };
    let clusterCount = 0;

    for (const clause of clauses) {
      clauseTypes.set(
        clause.clauseType,
        (clauseTypes.get(clause.clauseType) || 0) + 1
      );
      if (clause.riskLevel in riskDistribution) {
        riskDistribution[clause.riskLevel as keyof typeof riskDistribution]++;
      }
      if (clause.favorability in favorabilityDistribution) {
        favorabilityDistribution[
          clause.favorability as keyof typeof favorabilityDistribution
        ]++;
      }
      if (
        clause.clusterId !== undefined &&
        clause.clusterId !== null &&
        clause.clusterId + 1 > clusterCount
      ) {
        clusterCount = clause.clusterId + 1;
      }
    }

    const outlierCount = clauses.filter((c) => c.isOutlier).length;

    return {
      agreementCount: agreements.length,
      clauseCount: clauses.length,
      clusterCount,
      outlierCount,
      clauseTypeDistribution: Object.fromEntries(clauseTypes),
      riskDistribution,
      favorabilityDistribution,
      providers: agreements.map((a) => a.provider),
      hasAnalysis: analysisResults.length > 0,
    };
  },
});

// ═══════════════════════════════════════════════════════════════
// Public Actions: Process agreements and search
// ═══════════════════════════════════════════════════════════════

// Process a single agreement: extract clauses, generate embeddings, store
export const processAgreement = action({
  args: {
    name: v.string(),
    sourceFile: v.string(),
    documentText: v.string(),
  },
  handler: async (ctx, args): Promise<{
    agreementId: Id<"agreements">;
    provider: string;
    documentType: string;
    clauseCount: number;
  }> => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const voyageKey = process.env.VOYAGE_API_KEY;

    if (!anthropicKey) {
      throw new Error(
        "ANTHROPIC_API_KEY not configured in Convex environment variables"
      );
    }
    if (!voyageKey) {
      throw new Error(
        "VOYAGE_API_KEY not configured in Convex environment variables"
      );
    }

    console.log(`Processing agreement: ${args.name}`);

    // Step 1: Extract clauses using Claude
    console.log("  Extracting clauses with Claude...");
    const extraction = await extractClausesForVector(
      args.documentText,
      anthropicKey
    );
    console.log(
      `  Extracted ${extraction.clauses.length} clauses from ${extraction.provider}`
    );

    // Step 2: Generate embeddings for all clause texts + agreement summary
    console.log("  Generating embeddings with OpenAI...");
    const textsToEmbed = [
      // First element: agreement-level embedding (concatenated summaries)
      extraction.clauses.map((c) => `${c.title}: ${c.summary}`).join("\n"),
      // Remaining elements: individual clause embeddings
      ...extraction.clauses.map(
        (c) => `${c.clauseType} - ${c.title}: ${c.text}`
      ),
    ];

    const embeddings = await generateEmbeddings(textsToEmbed, voyageKey);
    const agreementEmbedding = embeddings[0];
    const clauseEmbeddings = embeddings.slice(1);

    // Step 3: Store the agreement
    console.log("  Storing agreement...");
    const wordCount = args.documentText.split(/\s+/).length;
    const agreementId: Id<"agreements"> = await ctx.runMutation(
      internal.vectorDb.storeAgreement,
      {
        name: args.name,
        provider: extraction.provider,
        sourceFile: args.sourceFile,
        fullText: args.documentText,
        clauseCount: extraction.clauses.length,
        wordCount,
        documentType: extraction.documentType,
        embedding: agreementEmbedding,
      }
    );

    // Step 4: Store each clause
    console.log("  Storing clauses...");
    for (let i = 0; i < extraction.clauses.length; i++) {
      const clause = extraction.clauses[i];
      await ctx.runMutation(internal.vectorDb.storeAgreementClause, {
        agreementId,
        agreementName: args.name,
        clauseType: clause.clauseType,
        title: clause.title,
        text: clause.text,
        summary: clause.summary,
        riskLevel: clause.riskLevel,
        favorability: clause.favorability,
        embedding: clauseEmbeddings[i],
      });
    }

    console.log(`  Done processing ${args.name}`);
    return {
      agreementId,
      provider: extraction.provider,
      documentType: extraction.documentType,
      clauseCount: extraction.clauses.length,
    };
  },
});

// Search for similar clauses given text
export const searchSimilarClauses = action({
  args: {
    text: v.string(),
    limit: v.optional(v.number()),
    clauseTypeFilter: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!voyageKey) throw new Error("VOYAGE_API_KEY not configured");

    // Generate embedding for the search text
    const [embedding] = await generateEmbeddings([args.text], voyageKey);

    // Vector search
    const results = await ctx.vectorSearch("agreementClauses", "by_embedding", {
      vector: embedding,
      limit: args.limit || 10,
      ...(args.clauseTypeFilter
        ? {
            filter: (q: any) =>
              q.eq("clauseType", args.clauseTypeFilter),
          }
        : {}),
    });

    // Fetch full documents
    if (results.length === 0) return [];

    const ids = results.map((r) => r._id as Id<"agreementClauses">);
    const docs: Doc<"agreementClauses">[] = await ctx.runQuery(
      internal.vectorDb.getClausesByIds,
      { ids }
    );

    // Merge scores with documents (omit embeddings)
    const output: any[] = [];
    for (const r of results) {
      const doc = docs.find((d) => d._id === r._id);
      if (!doc) continue;
      const { embedding: _, ...rest } = doc;
      output.push({ ...rest, _score: r._score });
    }
    return output;
  },
});

// Search for similar agreements given text
export const searchSimilarAgreements = action({
  args: {
    text: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!voyageKey) throw new Error("VOYAGE_API_KEY not configured");

    const [embedding] = await generateEmbeddings([args.text], voyageKey);

    const results = await ctx.vectorSearch("agreements", "by_embedding", {
      vector: embedding,
      limit: args.limit || 5,
    });

    if (results.length === 0) return [];

    const ids = results.map((r) => r._id as Id<"agreements">);
    const docs: Doc<"agreements">[] = await ctx.runQuery(
      internal.vectorDb.getAgreementsByIds,
      { ids }
    );

    const output: any[] = [];
    for (const r of results) {
      const doc = docs.find((d) => d._id === r._id);
      if (!doc) continue;
      const { embedding: _, fullText: __, ...rest } = doc;
      output.push({ ...rest, _score: r._score });
    }
    return output;
  },
});

// Get vector-enhanced insights for a clause (for playbook integration)
export const getClauseInsights = action({
  args: {
    clauseText: v.string(),
    clauseType: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!voyageKey) throw new Error("VOYAGE_API_KEY not configured");

    // Generate embedding
    const [embedding] = await generateEmbeddings([args.clauseText], voyageKey);

    // Find similar clauses
    const results = await ctx.vectorSearch("agreementClauses", "by_embedding", {
      vector: embedding,
      limit: 10,
    });

    if (results.length === 0) {
      return {
        similarClauses: [],
        marketPosition: "No comparison data available",
        riskAssessment: "Unable to assess - no similar clauses in database",
        suggestions: [],
      };
    }

    const ids = results.map((r) => r._id as Id<"agreementClauses">);
    const docs: Doc<"agreementClauses">[] = await ctx.runQuery(
      internal.vectorDb.getClausesByIds,
      { ids }
    );

    interface SimilarClauseResult {
      title: string;
      agreementName: string;
      clauseType: string;
      summary: string;
      riskLevel: string;
      favorability: string;
      similarity: number;
    }

    const similarClauses: SimilarClauseResult[] = [];
    for (const r of results) {
      const doc = docs.find((d) => d._id === r._id);
      if (!doc) continue;
      similarClauses.push({
        title: doc.title,
        agreementName: doc.agreementName,
        clauseType: doc.clauseType,
        summary: doc.summary,
        riskLevel: doc.riskLevel,
        favorability: doc.favorability,
        similarity: r._score,
      });
    }

    // Analyze the similar clauses to determine market position
    const riskCounts: Record<string, number> = { low: 0, medium: 0, high: 0 };
    const favCounts: Record<string, number> = {
      "provider-favorable": 0,
      neutral: 0,
      "customer-favorable": 0,
    };

    for (const clause of similarClauses) {
      if (clause.riskLevel in riskCounts) riskCounts[clause.riskLevel]++;
      if (clause.favorability in favCounts) favCounts[clause.favorability]++;
    }

    const totalSimilar = similarClauses.length;
    const avgSimilarity: number =
      similarClauses.reduce(
        (sum: number, c: SimilarClauseResult) => sum + (c.similarity || 0),
        0
      ) / totalSimilar;

    const dominantRisk = Object.entries(riskCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];
    const dominantFav = Object.entries(favCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    const marketPosition =
      avgSimilarity > 0.85
        ? "Very similar to market standard language"
        : avgSimilarity > 0.7
          ? "Moderately aligned with market standards"
          : "Deviates significantly from typical market language";

    const riskAssessment = `Most similar clauses in the corpus are rated ${dominantRisk} risk and ${dominantFav}. Average similarity: ${(avgSimilarity * 100).toFixed(1)}%.`;

    return {
      similarClauses,
      marketPosition,
      riskAssessment,
      avgSimilarity,
      riskDistribution: riskCounts,
      favorabilityDistribution: favCounts,
    };
  },
});

// Clear all vector DB data (for re-seeding)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const agreements = await ctx.db.query("agreements").collect();
    for (const a of agreements) await ctx.db.delete(a._id);

    const clauses = await ctx.db.query("agreementClauses").collect();
    for (const c of clauses) await ctx.db.delete(c._id);

    const analysis = await ctx.db.query("analysisResults").collect();
    for (const a of analysis) await ctx.db.delete(a._id);

    return {
      deleted: {
        agreements: agreements.length,
        clauses: clauses.length,
        analysisResults: analysis.length,
      },
    };
  },
});
