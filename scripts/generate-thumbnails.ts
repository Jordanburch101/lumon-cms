/**
 * Generates thumbnail screenshots from Storybook stories for use as
 * Payload CMS block picker previews.
 *
 * Usage:
 *   bun scripts/generate-thumbnails.ts              # serves storybook-static/
 *   bun scripts/generate-thumbnails.ts --url http://localhost:6006  # use running Storybook
 */

import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OUTPUT_DIR = join(import.meta.dir, "../public/block-thumbnails");
const VIEWPORT = { width: 1440, height: 900 };
const THUMB = { width: 480, height: 320 };
const SETTLE_MS = 500;

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const urlFlagIdx = process.argv.indexOf("--url");
const externalUrl =
  urlFlagIdx !== -1 ? process.argv[urlFlagIdx + 1] : undefined;

// ---------------------------------------------------------------------------
// Local Storybook server (only when no --url provided)
// ---------------------------------------------------------------------------

let server: ReturnType<typeof Bun.serve> | undefined;

async function startLocalServer(): Promise<string> {
  const staticDir = join(import.meta.dir, "../storybook-static");

  // Verify the build exists
  const indexFile = Bun.file(join(staticDir, "index.json"));
  if (!(await indexFile.exists())) {
    throw new Error(
      "storybook-static/index.json not found — run `bun storybook:build` first"
    );
  }

  server = Bun.serve({
    port: 0, // random available port
    async fetch(req) {
      let pathname = new URL(req.url).pathname;
      if (pathname === "/") pathname = "/index.html";

      const file = Bun.file(join(staticDir, pathname));
      if (await file.exists()) {
        return new Response(file);
      }
      // SPA fallback
      return new Response(Bun.file(join(staticDir, "index.html")));
    },
  });

  const url = `http://localhost:${server.port}`;
  console.log(`Serving storybook-static/ on ${url}\n`);
  return url;
}

// ---------------------------------------------------------------------------
// Story discovery
// ---------------------------------------------------------------------------

interface StoryEntry {
  id: string;
  name: string;
  title: string;
  type: string;
  exportName?: string;
}

async function discoverStories(
  baseUrl: string
): Promise<{ id: string; slug: string }[]> {
  const resp = await fetch(`${baseUrl}/index.json`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch index.json: ${resp.status}`);
  }

  const data = (await resp.json()) as { entries: Record<string, StoryEntry> };
  const stories: { id: string; slug: string }[] = [];

  for (const entry of Object.values(data.entries)) {
    if (entry.type !== "story") continue;

    // Convert exportName (PascalCase) to kebab-case filename
    const exportName = entry.exportName ?? entry.name;
    const slug = exportName
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .toLowerCase();

    stories.push({ id: entry.id, slug });
  }

  return stories;
}

// ---------------------------------------------------------------------------
// Find Chromium executable
// ---------------------------------------------------------------------------

async function findChromium(): Promise<string> {
  const cacheDir = join(
    process.env.HOME ?? "~",
    "Library/Caches/ms-playwright"
  );

  // Find the latest chromium (not chromium_headless_shell)
  const entries = await readdir(cacheDir);
  const dirs = entries
    .filter((e) => e.startsWith("chromium-") && !e.includes("headless_shell"))
    .map((e) => join(cacheDir, e))
    .sort();

  if (dirs.length === 0) {
    throw new Error(
      "No Chromium found in ~/Library/Caches/ms-playwright/ — run `bunx playwright install chromium`"
    );
  }

  const latestDir = dirs[dirs.length - 1];

  // Try known macOS Chromium paths (varies by Playwright version)
  const candidates = [
    "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium",
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
  ];

  for (const candidate of candidates) {
    const fullPath = join(latestDir, candidate);
    const { exitCode } = Bun.spawnSync(["test", "-f", fullPath]);
    if (exitCode === 0) return fullPath;
  }

  throw new Error(
    `Chromium executable not found in ${latestDir} — tried:\n${candidates.map((c) => `  ${c}`).join("\n")}`
  );
}

// ---------------------------------------------------------------------------
// Screenshot & resize
// ---------------------------------------------------------------------------

async function main() {
  const baseUrl = externalUrl ?? (await startLocalServer());

  console.log("Discovering stories...");
  const stories = await discoverStories(baseUrl);
  console.log(`Found ${stories.length} stories\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const executablePath = await findChromium();
  console.log(`Using Chromium: ${executablePath}\n`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  let succeeded = 0;
  let failed = 0;

  for (const story of stories) {
    const page = await context.newPage();
    const storyUrl = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`;

    try {
      await page.goto(storyUrl, { waitUntil: "networkidle" });

      // Remove decorator padding and vertically center short blocks
      await page.addStyleTag({
        content: `
          #storybook-root > div {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            min-height: 100vh;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
          }
        `,
      });

      await page.waitForTimeout(SETTLE_MS);

      const buffer = await page.screenshot({ type: "png" });

      // Detect whether the block is taller than the viewport — if so,
      // crop from top (heroes, bentos); otherwise center crop (CTAs, bars)
      const contentHeight = await page.evaluate(() => {
        const root = document.querySelector("#storybook-root > div");
        return root ? root.scrollHeight : 0;
      });
      const cropPosition = contentHeight > VIEWPORT.height ? "top" : "centre";

      const resized = await sharp(buffer)
        .resize(THUMB.width, THUMB.height, { fit: "cover", position: cropPosition })
        .png()
        .toBuffer();

      const outPath = join(OUTPUT_DIR, `${story.slug}.png`);
      await Bun.write(outPath, resized);

      console.log(`  ✓ ${story.slug}.png`);
      succeeded++;
    } catch (err) {
      console.error(
        `  ✗ ${story.slug}: ${err instanceof Error ? err.message : err}`
      );
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server?.stop();

  console.log(
    `\nDone: ${succeeded} succeeded, ${failed} failed → ${OUTPUT_DIR}`
  );
}

main().catch((err) => {
  console.error(err);
  server?.stop();
  process.exit(1);
});
