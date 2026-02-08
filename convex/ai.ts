import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Types for Claude response
interface ExtractedClause {
  title: string;
  originalText: string;
  summary: string;
  description: string;
  talkingPoints: string[];
  fallbackPositions: {
    position: string;
    rationale: string;
  }[];
}

interface ClauseExtractionResponse {
  clauses: ExtractedClause[];
}

// Process document and extract clauses using AI
export const processDocument = internalAction({
  args: {
    playbookId: v.id("playbooks"),
    generateContent: v.boolean(), // true = AI generates summaries/fallbacks, false = just parse
    documentText: v.optional(v.string()), // Optional: extracted text passed from client (e.g. for PDFs)
  },
  handler: async (ctx, args) => {
    try {
      // Get the playbook
      const playbook = await ctx.runQuery(internal.playbooks.getForProcessing, {
        id: args.playbookId,
      });

      if (!playbook) {
        throw new Error("Playbook not found");
      }

      // Get the file URL
      const fileUrl = await ctx.runQuery(internal.playbooks.getFileUrl, {
        fileId: playbook.fileId,
      });

      if (!fileUrl) {
        throw new Error("File not found");
      }

      let documentText = args.documentText ?? "";

      // If no text was provided, parse the file on the server (DOCX supported).
      if (!documentText) {
        // Fetch the file
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch file");
        }

        const arrayBuffer = await response.arrayBuffer();

        // Parse the document based on file type
        if (playbook.fileType === "docx") {
          documentText = await parseDocx(arrayBuffer);
        } else if (playbook.fileType === "pdf") {
          // pdfjs-based parsers often require DOM APIs not available in Convex actions.
          // PDFs should be extracted on the client and passed via `documentText`.
          throw new Error(
            "PDF text extraction must run in the browser. Please re-upload the PDF or try a .docx file."
          );
        } else {
          throw new Error(`Unsupported file type: ${playbook.fileType}`);
        }
      }

      if (!documentText || documentText.trim().length === 0) {
        throw new Error("Could not extract text from document");
      }

      // Use Claude to extract clauses
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        throw new Error("Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your Convex environment variables.");
      }

      const clauses = await extractClausesWithClaude(
        documentText,
        anthropicApiKey,
        args.generateContent
      );

      // Store the clauses
      await ctx.runMutation(internal.clauses.createMany, {
        playbookId: args.playbookId,
        userId: playbook.userId,
        clauses: clauses.map((clause, index) => ({
          order: index,
          title: clause.title,
          originalText: clause.originalText,
          summary: clause.summary || undefined,
          description: clause.description || undefined,
          talkingPoints: clause.talkingPoints?.length > 0 ? clause.talkingPoints : undefined,
          fallbackPositions: clause.fallbackPositions?.length > 0 ? clause.fallbackPositions : undefined,
        })),
      });

      // Update playbook status to ready
      await ctx.runMutation(internal.playbooks.updateStatus, {
        id: args.playbookId,
        status: "ready",
      });

      return { success: true, clauseCount: clauses.length };
    } catch (error) {
      console.error("Error processing document:", error);

      // Update playbook status to error
      await ctx.runMutation(internal.playbooks.updateStatus, {
        id: args.playbookId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      });

      throw error;
    }
  },
});

// Parse DOCX file using mammoth
async function parseDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  // Dynamic import for mammoth (works in Node.js runtime)
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

// Parse PDF file using pdf-parse
async function parsePdf(arrayBuffer: ArrayBuffer): Promise<string> {
  // Convex's action runtime can provide a `structuredClone` implementation
  // that does not support the `{ transfer: [...] }` option. pdfjs-dist calls
  // structuredClone with transfer; we can safely ignore transfer here.
  const existingStructuredClone = (globalThis as any).structuredClone;
  if (typeof existingStructuredClone === "function") {
    (globalThis as any).structuredClone = (value: any, _options?: any) =>
      existingStructuredClone(value);
  }

  // Dynamic import for pdf-parse
  const pdfParseModule = await import("pdf-parse");
  // pdf-parse ships different module shapes depending on bundler/TS settings.
  // Support both default-export and module-as-function.
  const pdfParse: any = (pdfParseModule as any).default ?? (pdfParseModule as any);
  const buffer = Buffer.from(arrayBuffer);
  const data = await pdfParse(buffer);
  return data.text;
}

// Extract clauses using Claude Sonnet
async function extractClausesWithClaude(
  documentText: string,
  apiKey: string,
  generateContent: boolean
): Promise<ExtractedClause[]> {
  const systemPrompt = generateContent
    ? `You are a legal document analyzer. Your task is to:
1. Identify and extract individual clauses from the legal agreement
2. For each clause, provide:
   - A clear title
   - The original text of the clause
   - A concise summary (2-3 sentences)
   - A description explaining the purpose and implications
   - 3-5 talking points for negotiation
   - 2-3 fallback positions with rationale

You MUST respond with ONLY a valid JSON object (no markdown, no explanation) with a "clauses" array containing objects with these fields:
- title: string
- originalText: string
- summary: string
- description: string
- talkingPoints: string[]
- fallbackPositions: { position: string, rationale: string }[]

Focus on substantive legal clauses, not boilerplate headers or signature blocks.`
    : `You are a legal document analyzer. Your task is to:
1. Identify and extract individual clauses from the legal agreement
2. For each clause, provide:
   - A clear title
   - The original text of the clause

You MUST respond with ONLY a valid JSON object (no markdown, no explanation) with a "clauses" array containing objects with these fields:
- title: string
- originalText: string
- summary: "" (empty string)
- description: "" (empty string)
- talkingPoints: [] (empty array)
- fallbackPositions: [] (empty array)

Focus on substantive legal clauses, not boilerplate headers or signature blocks.`;

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
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { 
          role: "user", 
          content: `Please analyze this legal document and extract the clauses. Respond with only valid JSON, no markdown code blocks:\n\n${documentText}` 
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

  if (!content) {
    throw new Error("No response from Claude");
  }

  // Parse the JSON response, handling potential markdown code blocks
  let jsonContent = content.trim();
  
  // Remove markdown code blocks if present
  if (jsonContent.startsWith("```json")) {
    jsonContent = jsonContent.slice(7);
  } else if (jsonContent.startsWith("```")) {
    jsonContent = jsonContent.slice(3);
  }
  if (jsonContent.endsWith("```")) {
    jsonContent = jsonContent.slice(0, -3);
  }
  jsonContent = jsonContent.trim();

  let parsed: ClauseExtractionResponse;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (parseError) {
    throw new Error(`Failed to parse Claude response as JSON: ${parseError}`);
  }

  if (!parsed.clauses || !Array.isArray(parsed.clauses)) {
    throw new Error("Invalid response format from Claude - missing clauses array");
  }

  return parsed.clauses;
}

// Action to trigger document processing (called from frontend)
export const startProcessing = action({
  args: {
    playbookId: v.id("playbooks"),
    generateContent: v.boolean(),
    documentText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Schedule the processing action
    await ctx.scheduler.runAfter(0, internal.ai.processDocument, {
      playbookId: args.playbookId,
      generateContent: args.generateContent,
      documentText: args.documentText,
    });

    return { scheduled: true };
  },
});
