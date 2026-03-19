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
// Category map — same source of truth as .storybook/generate.ts
// Maps Payload block slug → Storybook sidebar category
// ---------------------------------------------------------------------------

const CATEGORIES: Record<string, string> = {
  hero: "Heroes",
  heroCentered: "Heroes",
  heroMinimal: "Heroes",
  heroStats: "Heroes",
  bento: "Content",
  featuresGrid: "Content",
  splitMedia: "Content",
  richTextContent: "Content",
  latestArticles: "Content",
  imageGallery: "Content",
  testimonials: "Social Proof",
  team: "Social Proof",
  trust: "Social Proof",
  logoCloud: "Social Proof",
  cinematicCta: "CTAs",
  ctaBand: "CTAs",
  pricing: "Commerce",
  faq: "Commerce",
  statsBar: "Social Proof",
  partnerGrid: "Social Proof",
  jobListings: "Commerce",
  timeline: "Content",
  tabbedContent: "Content",
  comparisonTable: "Commerce",
};

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
  const category = CATEGORIES[slug];
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

/** Map of component directory/file paths to block slugs */
const PATH_TO_SLUGS: Record<string, string[]> = {
  // Most blocks: directory name matches kebab slug
  // Heroes share a directory, so hero/ maps to all 4
  "hero/hero.tsx": ["hero"],
  "hero/hero-centered.tsx": ["heroCentered"],
  "hero/hero-minimal.tsx": ["heroMinimal"],
  "hero/hero-stats.tsx": ["heroStats"],
};

// Auto-populate for non-hero blocks (directory name = kebab slug)
for (const slug of Object.keys(CATEGORIES)) {
  if (slug.startsWith("hero")) continue; // handled above
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
    // Block components: src/components/blocks/{dir}/{file}
    const blockMatch = file.match(
      /^src\/components\/blocks\/([^_][^/]+)\/(.+\.tsx?)$/
    );
    if (blockMatch) {
      const [, dir, filename] = blockMatch;
      // Check specific file first (for heroes), then directory
      const key = `${dir}/${filename}`;
      const dirKey = `${dir}/`;
      for (const s of PATH_TO_SLUGS[key] ?? PATH_TO_SLUGS[dirKey] ?? []) {
        slugs.add(s);
      }
      continue;
    }

    // Block schemas: src/payload/block-schemas/{Name}.ts
    const schemaMatch = file.match(/^src\/payload\/block-schemas\/(\w+)\.ts$/);
    if (schemaMatch) {
      const name = schemaMatch[1];
      // PascalCase → camelCase
      const slug = name.charAt(0).toLowerCase() + name.slice(1);
      if (slug in CATEGORIES) slugs.add(slug);
      continue;
    }

    // Fixtures: if block-fixtures.ts changes, regen all
    if (file.includes("block-fixtures.ts")) {
      return Object.keys(CATEGORIES);
    }
  }

  return [...slugs];
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const urlFlagIdx = process.argv.indexOf("--url");
const externalUrl =
  urlFlagIdx !== -1 ? process.argv[urlFlagIdx + 1] : undefined;

const slugsFlagIdx = process.argv.indexOf("--slugs");
const explicitSlugs =
  slugsFlagIdx !== -1
    ? process.argv[slugsFlagIdx + 1].split(",").map((s) => s.trim())
    : undefined;

const changedMode = process.argv.includes("--changed");

// Resolve which slugs to process
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
    const slug = exportName.charAt(0).toLowerCase() + exportName.slice(1);

    stories.push({ id: entry.id, slug, filename });
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

  // Resolve story targets
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
        .resize(THUMB.width, THUMB.height, {
          fit: "cover",
          position: cropPosition,
        })
        .png()
        .toBuffer();

      const outPath = join(OUTPUT_DIR, story.filename);
      await Bun.write(outPath, resized);

      console.log(`  ✓ ${story.filename}`);
      succeeded++;
    } catch (err) {
      console.error(
        `  ✗ ${story.filename}: ${err instanceof Error ? err.message : err}`
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
