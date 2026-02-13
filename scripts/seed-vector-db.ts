/**
 * Seed Vector Database
 * 
 * Reads 42 SaaS agreements from the "Saas Agreements" folder,
 * extracts text, and calls the Convex processAgreement action for each.
 * After all agreements are processed, runs the full analysis.
 * 
 * Usage:
 *   npx tsx scripts/seed-vector-db.ts
 * 
 * Prerequisites:
 *   - Set VOYAGE_API_KEY in Convex dashboard environment variables
 *   - Set ANTHROPIC_API_KEY in Convex dashboard environment variables  
 *   - Convex dev server should be running (npx convex dev)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as path from "path";
import { buildNameMap } from "./agreement-sources.js";

// ─── Configuration ───

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const AGREEMENTS_DIR = path.resolve(__dirname, "../Saas Agreements");

if (!CONVEX_URL) {
  // Try to read from .env.local
  try {
    const envPath = path.resolve(__dirname, "../.env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
    if (match) {
      process.env.NEXT_PUBLIC_CONVEX_URL = match[1].trim();
    }
  } catch {
    // ignore
  }
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error(
    "Error: NEXT_PUBLIC_CONVEX_URL not found. Make sure .env.local exists with your Convex URL."
  );
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

// ─── Text Extraction ───

async function extractTextFromPdf(filePath: string): Promise<string> {
  const mod: any = await import("pdf-parse");
  const pdfParse: any = mod?.default;
  const candidate1: any = mod; // sometimes the module itself is callable
  const candidate2: any = mod?.PDFParse; // observed in moduleKeys in logs
  const candidate3: any = mod?.default?.PDFParse;
  const candidate4: any = mod?.PDFParse?.default;
  const parseFn: any =
    (typeof pdfParse === "function" && pdfParse) ||
    (typeof candidate2 === "function" && candidate2) ||
    (typeof candidate1 === "function" && candidate1) ||
    (typeof candidate3 === "function" && candidate3) ||
    (typeof candidate4 === "function" && candidate4) ||
    undefined;

  const buffer = fs.readFileSync(filePath);

  try {
    if (typeof parseFn !== "function") {
      throw new TypeError(
        `No callable pdf-parse export found. default=${typeof mod?.default} PDFParse=${typeof mod?.PDFParse} module=${typeof mod}`
      );
    }
    const parseFnIsClass =
      typeof parseFn === "function" &&
      /^class\s/.test(Function.prototype.toString.call(parseFn));

    let extractedText = "";

    if (parseFnIsClass) {
      // pdf-parse@2.x exposes a PDFParse class and requires Uint8Array, not Buffer.
      const uint8 = new Uint8Array(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength
      );
      const parser = new parseFn(uint8);
      const result = await parser.getText();
      extractedText =
        typeof result === "string" ? result : (result?.text as string) || "";
    } else {
      // Older pdf-parse versions expose a callable function.
      const result = await parseFn(buffer);
      extractedText =
        typeof result === "string" ? result : (result?.text as string) || "";
    }

    return extractedText;
  } catch (err: any) {
    throw err;
  }
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({
    buffer: buffer,
  });
  return result.value;
}

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    return await extractTextFromPdf(filePath);
  } else if (ext === ".docx") {
    return await extractTextFromDocx(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
}

// ─── Friendly name from filename ───
// Loaded from the shared agreement-sources registry.

const _nameMap = buildNameMap();

function getAgreementName(filename: string): string {
  return _nameMap[filename] || filename.replace(/\.[^.]+$/, "").replace(/[_+]/g, " ");
}

// ─── Main ───

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║    Vector Database Seeding - Livo v.1        ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log();

  // Check for agreement files
  if (!fs.existsSync(AGREEMENTS_DIR)) {
    console.error(`Error: Directory not found: ${AGREEMENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(AGREEMENTS_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return (ext === ".pdf" || ext === ".docx") && !f.startsWith(".");
  });

  console.log(`Found ${files.length} agreement files:\n`);
  files.forEach((f, i) => console.log(`  ${i + 1}. ${getAgreementName(f)}`));
  console.log();

  // Step 1: Clear existing data
  console.log("Step 1: Clearing existing vector database...");
  try {
    const deleted = await client.mutation(api.vectorDb.clearAll, {});
    console.log(
      `  Cleared: ${deleted.deleted.agreements} agreements, ${deleted.deleted.clauses} clauses, ${deleted.deleted.analysisResults} analysis results`
    );
  } catch (e: any) {
    console.log(`  Note: ${e.message || "Could not clear (may be empty)"}`);
  }
  console.log();

  // Step 2: Process each agreement
  console.log("Step 2: Processing agreements...\n");
  const results = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const name = getAgreementName(filename);
    const filePath = path.join(AGREEMENTS_DIR, filename);

    console.log(
      `  [${i + 1}/${files.length}] Processing: ${name}`
    );
    console.log(`    File: ${filename}`);

    try {
      // Extract text
      console.log("    Extracting text...");
      const text = await extractText(filePath);
      const wordCount = text.split(/\s+/).length;
      console.log(`    Extracted ${wordCount} words`);

      if (text.trim().length < 100) {
        console.log("    WARNING: Very short text extracted. Skipping.");
        continue;
      }

      // Process via Convex action
      console.log("    Processing with AI (Claude + Voyage AI)...");
      const result = await client.action(api.vectorDb.processAgreement, {
        name,
        sourceFile: filename,
        documentText: text,
      });

      console.log(
        `    ✓ Done: ${result.clauseCount} clauses from ${result.provider} (${result.documentType})`
      );
      results.push(result);
    } catch (error: any) {
      console.error(`    ✗ Error: ${error.message}`);
      console.error(`    Continuing with next agreement...`);
    }

    console.log();
  }

  console.log(`\nProcessed ${results.length}/${files.length} agreements successfully.\n`);

  // Step 3: Run analysis
  if (results.length >= 2) {
    console.log("Step 3: Running full analysis (clusters, outliers, insights)...\n");
    try {
      const analysisResult = await client.action(api.analysis.runFullAnalysis, {});
      console.log("  Analysis complete:");
      console.log(`    Clauses analyzed: ${analysisResult.clausesAnalyzed}`);
      console.log(`    Agreements analyzed: ${analysisResult.agreementsAnalyzed}`);
      console.log(`    Clusters found: ${analysisResult.clustersFound}`);
      console.log(`    Outliers detected: ${analysisResult.outliersDetected}`);
      console.log(`    Insights generated: ${analysisResult.insightsGenerated}`);
    } catch (error: any) {
      console.error(`  Analysis error: ${error.message}`);
    }
  } else {
    console.log("Step 3: Skipped analysis (need at least 2 agreements).");
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║    Seeding Complete!                          ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(
    "\nVisit the Intelligence page in Livo to explore the results."
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
