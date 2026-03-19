/**
 * Generates thumbnail screenshots from Storybook stories for use as
 * Payload CMS block picker previews.
 *
 * Usage:
 *   bun scripts/generate-thumbnails.ts                        # all blocks
 *   bun scripts/generate-thumbnails.ts --slugs bento,pricing  # specific blocks (Payload slugs)
 *   bun scripts/generate-thumbnails.ts --url http://localhost:6006  # use running Storybook
 *   bun scripts/generate-thumbnails.ts --changed              # auto-detect from git staged files
 */

import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { platform } from "node:os";
import { chromium } from "playwright-core";
import sharp from "sharp";
import { BLOCK_CATEGORIES } from "../src/components/blocks/block-categories";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const OUTPUT_DIR = join(import.meta.dir, "../public/block-thumbnails");
const VIEWPORT = { width: 1440, height: 900 };
const THUMB = { width: 480, height: 320 };
const SETTLE_MS = 500;
const CONCURRENCY = 4;

// ---------------------------------------------------------------------------
// Slug ↔ story ID conversion
// ---------------------------------------------------------------------------

/** camelCase → kebab-case */
function toKebab(s: string): string {
  return s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** Payload slug → Storybook story ID */
function slugToStoryId(slug: string): string {
  const category = BLOCK_CATEGORIES[slug];
  if (!category) throw new Error(`Unknown block slug: ${slug}`);
  const categoryKebab = category.toLowerCase().replace(/\s+/g, "-");
  const exportKebab = toKebab(slug.charAt(0).toUpperCase() + slug.slice(1));
  return `blocks-${categoryKebab}--${exportKebab}`;
}

/** Payload slug → thumbnail filename */
function slugToFilename(slug: string): string {
  return `${toKebab(slug.charAt(0).toUpperCase() + slug.slice(1))}.png`;
}

// ---------------------------------------------------------------------------
// Component path → block slug mapping (for --changed)
// ---------------------------------------------------------------------------

const PATH_TO_SLUGS: Record<string, string[]> = {
  "hero/hero.tsx": ["hero"],
  "hero/hero-centered.tsx": ["heroCentered"],
  "hero/hero-minimal.tsx": ["heroMinimal"],
  "hero/hero-stats.tsx": ["heroStats"],
};

for (const slug of Object.keys(BLOCK_CATEGORIES)) {
  if (slug.startsWith("hero")) continue;
  const dir = toKebab(slug.charAt(0).toUpperCase() + slug.slice(1));
  PATH_TO_SLUGS[`${dir}/`] = [slug];
}

/** Detect changed block slugs from git staged files */
function detectChangedSlugs(): string[] {
  const { stdout } = Bun.spawnSync(
    ["git", "diff", "--cached", "--name-only"],
    { stdout: "pipe" }
  );
  const files = stdout.toString().trim().split("\n").filter(Boolean);
  const slugs = new Set<string>();

  for (const file of files) {
    const blockMatch = file.match(
      /^src\/components\/blocks\/([^_][^/]+)\/(.+\.tsx?)$/
    );
    if (blockMatch) {
      const [, dir, filename] = blockMatch;
      const key = `${dir}/${filename}`;
      const dirKey = `${dir}/`;
      for (const s of PATH_TO_SLUGS[key] ?? PATH_TO_SLUGS[dirKey] ?? []) {
        slugs.add(s);
      }
      continue;
    }

    const schemaMatch = file.match(/^src\/payload\/block-schemas\/(\w+)\.ts$/);
    if (schemaMatch) {
      const name = schemaMatch[1];
      const slug = name.charAt(0).toLowerCase() + name.slice(1);
      if (slug in BLOCK_CATEGORIES) slugs.add(slug);
      continue;
    }

    if (file.includes("block-fixtures.ts")) {
      return Object.keys(BLOCK_CATEGORIES);
    }
  }

  return [...slugs];
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

function parseFlag(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  const value = process.argv[idx + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

const externalUrl = parseFlag("--url");
const slugsArg = parseFlag("--slugs");
const explicitSlugs = slugsArg
  ? slugsArg.split(",").map((s) => s.trim())
  : undefined;
const changedMode = process.argv.includes("--changed");

let targetSlugs: string[] | undefined;
if (explicitSlugs) {
  targetSlugs = explicitSlugs;
} else if (changedMode) {
  targetSlugs = detectChangedSlugs();
  if (targetSlugs.length === 0) {
    console.log("No block changes detected in staged files — nothing to do.");
    process.exit(0);
  }
  console.log(
    `Detected ${targetSlugs.length} changed block(s): ${targetSlugs.join(", ")}\n`
  );
}

// ---------------------------------------------------------------------------
// Local Storybook server (only when no --url provided)
// ---------------------------------------------------------------------------

let server: ReturnType<typeof Bun.serve> | undefined;

async function startLocalServer(): Promise<string> {
  const staticDir = join(import.meta.dir, "../storybook-static");

  const indexFile = Bun.file(join(staticDir, "index.json"));
  if (!(await indexFile.exists())) {
    throw new Error(
      "storybook-static/index.json not found — run `bun storybook:build` first"
    );
  }

  server = Bun.serve({
    port: 0,
    async fetch(req) {
      let pathname = new URL(req.url).pathname;
      if (pathname === "/") pathname = "/index.html";

      const file = Bun.file(join(staticDir, pathname));
      if (await file.exists()) {
        return new Response(file);
      }
      return new Response(Bun.file(join(staticDir, "index.html")));
    },
  });

  const url = `http://localhost:${server.port}`;
  console.log(`Serving storybook-static/ on ${url}\n`);
  return url;
}

// ---------------------------------------------------------------------------
// Build story list from slugs or from Storybook index
// ---------------------------------------------------------------------------

interface StoryTarget {
  id: string;
  slug: string;
  filename: string;
}

function storiesFromSlugs(slugs: string[]): StoryTarget[] {
  return slugs.map((slug) => ({
    id: slugToStoryId(slug),
    slug,
    filename: slugToFilename(slug),
  }));
}

interface StoryEntry {
  id: string;
  name: string;
  title: string;
  type: string;
  exportName?: string;
}

async function discoverAllStories(baseUrl: string): Promise<StoryTarget[]> {
  const resp = await fetch(`${baseUrl}/index.json`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch index.json: ${resp.status}`);
  }

  const data = (await resp.json()) as { entries: Record<string, StoryEntry> };
  const stories: StoryTarget[] = [];

  for (const entry of Object.values(data.entries)) {
    if (entry.type !== "story") continue;

    const exportName = entry.exportName ?? entry.name;
    const filename = `${toKebab(exportName)}.png`;
    // Derive the camelCase slug from the export name for display
    const slug = exportName.charAt(0).toLowerCase() + exportName.slice(1);

    stories.push({ id: entry.id, slug, filename });
  }

  return stories;
}

// ---------------------------------------------------------------------------
// Find Chromium executable (cross-platform)
// ---------------------------------------------------------------------------

async function findChromium(): Promise<string> {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? "~";
  const os = platform();

  // Playwright cache locations by platform
  const cacheDirs: string[] = [];
  if (os === "darwin") {
    cacheDirs.push(join(home, "Library/Caches/ms-playwright"));
  } else if (os === "linux") {
    cacheDirs.push(join(home, ".cache/ms-playwright"));
  } else if (os === "win32") {
    cacheDirs.push(join(home, "AppData/Local/ms-playwright"));
  }
  // Fallback: try all common locations
  cacheDirs.push(
    join(home, "Library/Caches/ms-playwright"),
    join(home, ".cache/ms-playwright")
  );

  for (const cacheDir of cacheDirs) {
    let entries: string[];
    try {
      entries = await readdir(cacheDir);
    } catch {
      continue;
    }

    const dirs = entries
      .filter((e) => e.startsWith("chromium-") && !e.includes("headless_shell"))
      .map((e) => join(cacheDir, e))
      .sort();

    if (dirs.length === 0) continue;

    const latestDir = dirs[dirs.length - 1];

    // Executable paths by platform
    const candidates: string[] = [];
    if (os === "darwin") {
      candidates.push(
        "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
        "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium"
      );
    } else if (os === "linux") {
      candidates.push(
        "chrome-linux64/chrome",
        "chrome-linux/chrome",
        "chrome-linux64/Google Chrome for Testing",
        "chrome-linux/Google Chrome for Testing"
      );
    } else if (os === "win32") {
      candidates.push(
        "chrome-win64/chrome.exe",
        "chrome-win/chrome.exe"
      );
    }

    for (const candidate of candidates) {
      const fullPath = join(latestDir, candidate);
      const { exitCode } = Bun.spawnSync(["test", "-f", fullPath]);
      if (exitCode === 0) return fullPath;
    }
  }

  throw new Error(
    `Chromium not found — run \`bunx playwright install chromium\`\nSearched: ${cacheDirs.join(", ")}`
  );
}

// ---------------------------------------------------------------------------
// Screenshot a single story
// ---------------------------------------------------------------------------

async function screenshotStory(
  context: Awaited<ReturnType<typeof chromium.launch>>["contexts"][0],
  baseUrl: string,
  story: StoryTarget
): Promise<boolean> {
  const page = await context.newPage();
  const storyUrl = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story&globals=theme:light`;

  try {
    await page.goto(storyUrl, { waitUntil: "networkidle" });

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

    const contentHeight = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root > div");
      return root ? root.scrollHeight : 0;
    });
    const cropPosition = contentHeight > VIEWPORT.height ? "top" : "centre";

    const resized = await sharp(buffer)
      .resize(THUMB.width, THUMB.height, {
        fit: "cover",
        position: cropPosition,
      })
      .png()
      .toBuffer();

    const outPath = join(OUTPUT_DIR, story.filename);
    await Bun.write(outPath, resized);

    console.log(`  ✓ ${story.filename}`);
    return true;
  } catch (err) {
    console.error(
      `  ✗ ${story.filename}: ${err instanceof Error ? err.message : err}`
    );
    return false;
  } finally {
    await page.close();
  }
}

// ---------------------------------------------------------------------------
// Main — parallel screenshot processing
// ---------------------------------------------------------------------------

async function main() {
  const baseUrl = externalUrl ?? (await startLocalServer());

  let stories: StoryTarget[];
  if (targetSlugs) {
    stories = storiesFromSlugs(targetSlugs);
    console.log(`Targeting ${stories.length} block(s)\n`);
  } else {
    console.log("Discovering stories...");
    stories = await discoverAllStories(baseUrl);
    console.log(`Found ${stories.length} stories\n`);
  }

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

  // Process stories in parallel batches
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < stories.length; i += CONCURRENCY) {
    const batch = stories.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((story) => screenshotStory(context, baseUrl, story))
    );
    for (const ok of results) {
      if (ok) succeeded++;
      else failed++;
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
