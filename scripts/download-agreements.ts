/**
 * Download SaaS Agreements
 *
 * Iterates over the agreement registry and downloads each agreement
 * that doesn't already exist in the "Saas Agreements" folder.
 *
 * - HTML pages are rendered to PDF via Puppeteer (headless Chrome).
 * - Direct PDF links are fetched and written to disk.
 *
 * Usage:
 *   npx tsx scripts/download-agreements.ts
 *   npm run download:agreements
 *
 * Options:
 *   --force     Re-download even if the file already exists
 *   --only=N    Download only the Nth new agreement (1-based)
 *   --dry-run   Print what would be downloaded without doing it
 */

import * as fs from "fs";
import * as path from "path";
import { NEW_AGREEMENTS, type AgreementSource } from "./agreement-sources.js";

// ─── Configuration ───

const AGREEMENTS_DIR = path.resolve(__dirname, "../Saas Agreements");
const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_ARG = process.argv.find((a) => a.startsWith("--only="));
const ONLY_INDEX = ONLY_ARG ? parseInt(ONLY_ARG.split("=")[1], 10) : null;

/** Maximum time to wait for a page to load (ms) */
const PAGE_TIMEOUT = 60_000;
/** Delay between downloads to be respectful to servers (ms) */
const COURTESY_DELAY = 3_000;

// ─── Helpers ───

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

// ─── Download via Puppeteer (HTML → PDF) ───

async function downloadHtmlAsPdf(
  source: AgreementSource,
  outputPath: string,
  browser: any
): Promise<void> {
  const page = await browser.newPage();
  try {
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 900 });

    // Set user-agent to avoid bot-blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log(`    Navigating to ${truncate(source.url, 80)}...`);
    await page.goto(source.url, {
      waitUntil: "networkidle2",
      timeout: PAGE_TIMEOUT,
    });

    // Give dynamic content a moment to settle
    await sleep(2_000);

    // Save as PDF
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });
  } finally {
    await page.close();
  }
}

// ─── Download direct PDF ───

async function downloadPdfDirect(
  source: AgreementSource,
  outputPath: string
): Promise<void> {
  console.log(`    Fetching PDF from ${truncate(source.url, 80)}...`);
  const response = await fetch(source.url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("pdf") && !contentType.includes("octet-stream")) {
    console.log(
      `    Warning: Content-Type is "${contentType}" (expected PDF). Saving anyway.`
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ─── Main ───

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║    SaaS Agreement Downloader - Livo v.1              ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log();

  // Ensure output directory exists
  if (!fs.existsSync(AGREEMENTS_DIR)) {
    fs.mkdirSync(AGREEMENTS_DIR, { recursive: true });
    console.log(`Created directory: ${AGREEMENTS_DIR}`);
  }

  // Determine which agreements to download
  let targets = [...NEW_AGREEMENTS];
  if (ONLY_INDEX !== null) {
    if (ONLY_INDEX < 1 || ONLY_INDEX > NEW_AGREEMENTS.length) {
      console.error(
        `Error: --only=${ONLY_INDEX} is out of range (1-${NEW_AGREEMENTS.length})`
      );
      process.exit(1);
    }
    targets = [NEW_AGREEMENTS[ONLY_INDEX - 1]];
    console.log(`Mode: downloading only #${ONLY_INDEX} (${targets[0].company})`);
  }

  if (FORCE) console.log("Mode: --force (re-downloading existing files)");
  if (DRY_RUN) console.log("Mode: --dry-run (no files will be written)\n");

  // Check what already exists
  const toDownload: AgreementSource[] = [];
  const skipped: string[] = [];

  for (const source of targets) {
    const outputPath = path.join(AGREEMENTS_DIR, source.filename);
    if (!FORCE && fs.existsSync(outputPath)) {
      skipped.push(source.company);
    } else {
      toDownload.push(source);
    }
  }

  if (skipped.length > 0) {
    console.log(
      `Skipping ${skipped.length} already downloaded: ${skipped.join(", ")}\n`
    );
  }

  if (toDownload.length === 0) {
    console.log("Nothing to download. All agreements already exist.");
    console.log('Use --force to re-download.\n');
    return;
  }

  console.log(`Downloading ${toDownload.length} agreements...\n`);

  if (DRY_RUN) {
    for (const source of toDownload) {
      console.log(`  [DRY RUN] ${source.company}: ${source.agreementName}`);
      console.log(`            URL:  ${source.url}`);
      console.log(`            Type: ${source.type}`);
      console.log(`            File: ${source.filename}\n`);
    }
    return;
  }

  // Launch Puppeteer only if we have HTML sources
  const needsBrowser = toDownload.some((s) => s.type === "html");
  let browser: any = null;

  if (needsBrowser) {
    console.log("Launching headless browser...\n");
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }

  const results: { company: string; status: "success" | "failed"; error?: string }[] = [];

  try {
    for (let i = 0; i < toDownload.length; i++) {
      const source = toDownload[i];
      const outputPath = path.join(AGREEMENTS_DIR, source.filename);

      console.log(
        `  [${i + 1}/${toDownload.length}] ${source.company} - ${source.agreementName}`
      );

      try {
        if (source.type === "pdf") {
          await downloadPdfDirect(source, outputPath);
        } else {
          await downloadHtmlAsPdf(source, outputPath, browser);
        }

        // Verify the file was created and has content
        const stat = fs.statSync(outputPath);
        if (stat.size < 1000) {
          console.log(
            `    Warning: File is very small (${stat.size} bytes). May not contain useful content.`
          );
        }
        console.log(`    Done (${(stat.size / 1024).toFixed(1)} KB)\n`);
        results.push({ company: source.company, status: "success" });
      } catch (error: any) {
        console.error(`    FAILED: ${error.message}\n`);
        results.push({
          company: source.company,
          status: "failed",
          error: error.message,
        });
        // Clean up partial file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }

      // Courtesy delay between requests
      if (i < toDownload.length - 1) {
        await sleep(COURTESY_DELAY);
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  // ─── Summary ───

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║    Download Summary                                  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  const successes = results.filter((r) => r.status === "success");
  const failures = results.filter((r) => r.status === "failed");

  if (successes.length > 0) {
    console.log(`  Successful (${successes.length}):`);
    successes.forEach((r) => console.log(`    + ${r.company}`));
    console.log();
  }

  if (failures.length > 0) {
    console.log(`  Failed (${failures.length}):`);
    failures.forEach((r) => console.log(`    x ${r.company}: ${r.error}`));
    console.log();
  }

  if (skipped.length > 0) {
    console.log(`  Skipped (${skipped.length} already existed):`);
    skipped.forEach((c) => console.log(`    - ${c}`));
    console.log();
  }

  const totalInDir = fs
    .readdirSync(AGREEMENTS_DIR)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return (ext === ".pdf" || ext === ".docx") && !f.startsWith(".");
    }).length;

  console.log(`  Total agreements in folder: ${totalInDir}`);
  console.log(
    `\nNext step: run  npm run seed:vector-db  to process all agreements.\n`
  );
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
