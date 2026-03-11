# Media Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upload-time media optimization so raw uploads are resized, converted, and enhanced with blur placeholders before reaching storage.

**Architecture:** Images optimized natively via Payload's `formatOptions`/`resizeOptions` (sync, sharp). Videos transcoded via ffmpeg through Payload's Jobs Queue (async). Blur placeholders (base64 WebP) generated in `afterChange` hooks for instant loading UX.

**Tech Stack:** Payload CMS 3.x, sharp (installed), ffmpeg (optional system dep), Next.js Image component

**Spec:** `docs/superpowers/specs/2026-03-11-media-optimization-design.md`

---

## Chunk 1: Foundation (Media Config + ffmpeg Utility)

### Task 1: Update Media Collection Config

**Files:**
- Modify: `src/collections/Media.ts`

Note: Adding fields to the collection will trigger a database migration on next `bun dev`. Payload handles this automatically in dev mode — expect a migration prompt or auto-migration on first startup after this change.

- [ ] **Step 1: Add upload optimization config and new fields**

Replace the entire contents of `src/collections/Media.ts` with:

```ts
import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    formatOptions: {
      format: "webp",
      options: { quality: 82 },
    },
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: "inside",
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
      },
      {
        name: "hero",
        width: 1920,
        height: undefined,
        withoutEnlargement: true,
      },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "stripAudio",
      type: "checkbox",
      defaultValue: true,
      admin: {
        condition: (data) => data?.mimeType?.startsWith("video/"),
      },
    },
    {
      name: "blurDataURL",
      type: "text",
      admin: {
        hidden: true,
      },
    },
  ],
};
```

- [ ] **Step 2: Verify the upload config works**

Run: `bun dev`

1. Open `http://localhost:3000/admin`
2. Navigate to Media collection
3. Upload a large image (>1MB, any format — PNG, JPG)
4. Verify in the admin panel:
   - The image is stored as WebP
   - Thumbnail, card, and hero variants appear in the admin detail view
   - Focal point and crop controls are available
5. Upload a video file
6. Verify the `stripAudio` checkbox appears on the video document

- [ ] **Step 3: Commit**

```bash
git add src/collections/Media.ts
git commit -m "feat: add image optimization config and imageSizes to Media collection

Add formatOptions (WebP, quality 82), resizeOptions (2560px cap),
three imageSizes variants (thumbnail, card, hero), focalPoint, crop,
stripAudio field for videos, and blurDataURL field for blur placeholders."
```

---

### Task 2: Create ffmpeg Utility

**Files:**
- Create: `src/lib/ffmpeg.ts`

Note: `src/lib/` is a new directory. This is project-specific code (not upstream-safe `core/`).

- [ ] **Step 1: Create the `src/lib/` directory**

Run: `mkdir -p src/lib`

- [ ] **Step 2: Write the ffmpeg utility**

Create `src/lib/ffmpeg.ts`:

```ts
import { execFile } from "node:child_process";

let ffmpegAvailable: boolean | null = null;

/**
 * Check if ffmpeg is available on the system.
 * Result is cached for the process lifetime.
 */
export async function isFFmpegAvailable(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable;

  try {
    await runFFmpeg(["-version"]);
    ffmpegAvailable = true;
  } catch {
    ffmpegAvailable = false;
  }

  return ffmpegAvailable;
}

/**
 * Run an ffmpeg command with the given arguments.
 * Returns stdout/stderr on success, throws on failure.
 */
export function runFFmpeg(
  args: string[],
  timeoutMs = 5 * 60 * 1000,
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = execFile(
      "ffmpeg",
      args,
      { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `ffmpeg failed: ${error.message}\nstderr: ${stderr}`,
            ),
          );
          return;
        }
        resolve({ stdout, stderr });
      },
    );

    proc.on("error", (err) => {
      reject(new Error(`ffmpeg not found or failed to start: ${err.message}`));
    });
  });
}
```

- [ ] **Step 3: Verify it compiles**

Run: `bun check`

- [ ] **Step 4: Commit**

```bash
git add src/lib/ffmpeg.ts
git commit -m "feat: add ffmpeg detection and command runner utility

Cached runtime check for ffmpeg availability with graceful fallback.
Promise-based execFile wrapper with configurable timeout (default 5min)."
```

---

### Task 3: Update next.config.ts with S3 Remote Patterns

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add Railway S3 hostname to remotePatterns**

In `next.config.ts`, add the Railway S3 pattern to the `remotePatterns` array:

```ts
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "*.railway.app",
    },
  ],
},
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "fix: add Railway S3 hostname to next/image remotePatterns

Without this, images served from the Railway S3 bucket fail
in the next/image optimization pipeline."
```

---

## Chunk 2: Hooks + Jobs (Blur Generation + Video Optimization)

### Task 4: Create Blur Placeholder Generation Hook

**Files:**
- Create: `src/collections/hooks/generateBlurDataURL.ts`
- Modify: `src/collections/Media.ts` (add hook registration)

- [ ] **Step 1: Create the hooks directory**

Run: `mkdir -p src/collections/hooks`

- [ ] **Step 2: Write the blur generation hook**

Create `src/collections/hooks/generateBlurDataURL.ts`:

```ts
import sharp from "sharp";
import type { CollectionAfterChangeHook } from "payload";

export const generateBlurDataURL: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop — skip if we triggered this via our own update
  if (context.skipBlurGeneration) return doc;

  // Only process images
  if (!doc.mimeType?.startsWith("image/")) return doc;

  // Only on create or when a new file is uploaded
  if (operation !== "create" && !req.file) return doc;

  try {
    // Get the image buffer — try req.file first, fall back to fetching from URL
    let buffer: Buffer | undefined = req.file?.data
      ? Buffer.from(req.file.data)
      : undefined;

    if (!buffer && doc.url) {
      const response = await fetch(doc.url);
      if (response.ok) {
        buffer = Buffer.from(await response.arrayBuffer());
      }
    }

    if (!buffer) return doc;

    // Generate a tiny blurred WebP placeholder
    const blurBuffer = await sharp(buffer)
      .resize(16) // 16px wide, preserve aspect ratio
      .blur(10)
      .webp({ quality: 20 })
      .toBuffer();

    const base64 = blurBuffer.toString("base64");
    const blurDataURL = `data:image/webp;base64,${base64}`;

    // Update the document with the blur placeholder
    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { blurDataURL },
      context: { skipBlurGeneration: true },
      req,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to generate blur placeholder",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return doc;
};
```

- [ ] **Step 3: Register the hook in Media collection**

In `src/collections/Media.ts`, add the import and hooks config:

Add import at top:
```ts
import { generateBlurDataURL } from "./hooks/generateBlurDataURL";
```

Add hooks to the collection config (after `access`):
```ts
hooks: {
  afterChange: [generateBlurDataURL],
},
```

- [ ] **Step 4: Verify blur generation works**

Run: `bun dev`

1. Upload an image via the admin panel
2. After upload, check the Media document via REST API: `http://localhost:3000/api/media/<id>`
3. Verify the response includes a `blurDataURL` field starting with `data:image/webp;base64,`
4. Verify the base64 string is short (200-500 characters)

- [ ] **Step 5: Commit**

```bash
git add src/collections/hooks/generateBlurDataURL.ts src/collections/Media.ts
git commit -m "feat: generate base64 blur placeholders on image upload

afterChange hook uses sharp to create a 16px blurred WebP
base64 string stored in blurDataURL. Uses context flag to
prevent infinite hook loops. Falls back to fetching from
doc.url if req.file buffer is unavailable."
```

---

### Task 5: Create Video Optimization Job Task

**Files:**
- Create: `src/jobs/optimizeVideo.ts`

- [ ] **Step 1: Create the jobs directory**

Run: `mkdir -p src/jobs`

- [ ] **Step 2: Write the video optimization job**

Create `src/jobs/optimizeVideo.ts`:

```ts
import { readFile, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TaskConfig } from "payload";
import sharp from "sharp";
import { isFFmpegAvailable, runFFmpeg } from "@/lib/ffmpeg";

export const optimizeVideoTask: TaskConfig<"optimizeVideo"> = {
  slug: "optimizeVideo",
  inputSchema: [
    { name: "mediaId", type: "number", required: true },
  ],
  retries: 2,
  handler: async ({ input, req }) => {
    const { mediaId } = input;

    // Fetch the media document
    const media = await req.payload.findByID({
      collection: "media",
      id: mediaId,
    });

    if (!media?.url) {
      req.payload.logger.error({ msg: `Media ${mediaId} has no URL` });
      return { output: {} };
    }

    // Verify it's still a video (could have been replaced between queue and execution)
    if (!media.mimeType?.startsWith("video/")) {
      req.payload.logger.info({
        msg: `Media ${mediaId} is no longer a video, skipping`,
      });
      return { output: {} };
    }

    // Check ffmpeg availability
    if (!(await isFFmpegAvailable())) {
      req.payload.logger.warn({
        msg: "ffmpeg not available — skipping video optimization",
      });
      return { output: {} };
    }

    const inputPath = join(tmpdir(), `payload-video-input-${mediaId}`);
    const outputPath = join(tmpdir(), `payload-video-output-${mediaId}.mp4`);
    const framePath = join(tmpdir(), `payload-video-frame-${mediaId}.jpg`);

    try {
      // Download the video from its URL
      const response = await fetch(media.url);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status}`);
      }
      const videoBuffer = Buffer.from(await response.arrayBuffer());
      await writeFile(inputPath, videoBuffer);

      // Build ffmpeg arguments
      const ffmpegArgs: string[] = [
        "-y", // overwrite output
        "-i", inputPath,
        "-c:v", "libx264",
        "-preset", "medium",
        "-b:v", "5M",
        "-maxrate", "6M",
        "-bufsize", "12M",
        "-vf", "scale=min(1920\\,iw):min(1080\\,ih):force_original_aspect_ratio=decrease,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-movflags", "+faststart",
      ];

      // Audio handling
      if (media.stripAudio) {
        ffmpegArgs.push("-an");
      } else {
        ffmpegArgs.push("-c:a", "aac", "-b:a", "128k");
      }

      ffmpegArgs.push(outputPath);

      // Run ffmpeg
      await runFFmpeg(ffmpegArgs);

      // Extract a frame for blur placeholder
      await runFFmpeg([
        "-y",
        "-ss", "1",
        "-i", inputPath,
        "-vframes", "1",
        "-q:v", "10",
        framePath,
      ]);

      // Generate blur placeholder from the extracted frame
      let blurDataURL: string | undefined;
      try {
        const frameBuffer = await readFile(framePath);
        const blurBuffer = await sharp(frameBuffer)
          .resize(16)
          .blur(10)
          .webp({ quality: 20 })
          .toBuffer();
        blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
      } catch {
        req.payload.logger.warn({
          msg: "Failed to generate video blur placeholder",
        });
      }

      // Read the optimized video and upload back via Payload local API
      const optimizedBuffer = await readFile(outputPath);
      const newFilename =
        media.filename?.replace(/\.[^.]+$/, ".mp4") || "video.mp4";

      await req.payload.update({
        collection: "media",
        id: mediaId,
        data: {
          ...(blurDataURL && { blurDataURL }),
        },
        file: {
          data: optimizedBuffer,
          mimetype: "video/mp4",
          name: newFilename,
          size: optimizedBuffer.length,
        },
        overwriteExistingFiles: true,
        context: {
          skipVideoOptimization: true,
          skipBlurGeneration: true,
        },
        req,
      });

      req.payload.logger.info({
        msg: `Video ${mediaId} optimized: ${videoBuffer.length} → ${optimizedBuffer.length} bytes`,
      });
    } finally {
      // Clean up temp files
      await Promise.allSettled([
        unlink(inputPath),
        unlink(outputPath),
        unlink(framePath),
      ]);
    }

    return { output: {} };
  },
};
```

- [ ] **Step 3: Verify it compiles**

Run: `bun check`

- [ ] **Step 4: Commit**

```bash
git add src/jobs/optimizeVideo.ts
git commit -m "feat: add async video optimization job task

Payload Jobs Queue task that transcodes videos to H.264/MP4,
caps at 1080p, handles audio stripping, generates blur placeholder,
and replaces original in S3 via local API file upload."
```

---

### Task 6: Create Video Optimization Hook + Register Job

**Files:**
- Create: `src/collections/hooks/optimizeVideo.ts`
- Modify: `src/collections/Media.ts` (add hook)
- Modify: `src/payload.config.ts` (register job task + autoRun)

- [ ] **Step 1: Write the video optimization hook**

Create `src/collections/hooks/optimizeVideo.ts`:

```ts
import type { CollectionAfterChangeHook } from "payload";
import { isFFmpegAvailable } from "@/lib/ffmpeg";

export const optimizeVideo: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  operation,
  context,
}) => {
  // Prevent infinite loop
  if (context.skipVideoOptimization) return doc;

  // Only process videos
  if (!doc.mimeType?.startsWith("video/")) return doc;

  // Determine if we should process
  const isNewUpload = operation === "create";
  const isFileReupload = operation === "update" && !!req.file;
  const isAudioToggle =
    operation === "update" &&
    previousDoc?.stripAudio !== doc.stripAudio;

  if (!isNewUpload && !isFileReupload && !isAudioToggle) return doc;

  // Check ffmpeg availability
  if (!(await isFFmpegAvailable())) {
    req.payload.logger.warn({
      msg: "ffmpeg not available — video stored without optimization",
    });
    return doc;
  }

  // Queue the optimization job
  try {
    await req.payload.jobs.queue({
      task: "optimizeVideo",
      input: { mediaId: doc.id },
      req,
    });

    req.payload.logger.info({
      msg: `Queued video optimization for media ${doc.id}`,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to queue video optimization job",
      err: err instanceof Error ? err : new Error(String(err)),
    });
  }

  return doc;
};
```

- [ ] **Step 2: Register the hook in Media collection**

In `src/collections/Media.ts`, add the import:

```ts
import { optimizeVideo } from "./hooks/optimizeVideo";
```

Update the hooks config to include both hooks:

```ts
hooks: {
  afterChange: [generateBlurDataURL, optimizeVideo],
},
```

- [ ] **Step 3: Register the job task and autoRun in payload.config.ts**

In `src/payload.config.ts`, add the import:

```ts
import { optimizeVideoTask } from "./jobs/optimizeVideo";
```

Add the `jobs` config to `buildConfig` (after `sharp`). The `autoRun` type is `AutorunCronConfig[]` — an array of cron configs:

```ts
jobs: {
  tasks: [optimizeVideoTask],
  autoRun: [
    { cron: "* * * * *" },
  ],
},
```

This runs the job queue every minute. Without `autoRun`, jobs would be queued but never executed.

- [ ] **Step 4: Verify the full pipeline**

Run: `bun dev`

1. Upload an image → verify WebP conversion, imageSizes variants in admin, blurDataURL in API response
2. If ffmpeg is installed: upload a video → verify the optimization job runs (check server logs for "Queued video optimization" and "Video X optimized" messages)
3. If ffmpeg is not installed: upload a video → verify the warning log appears and the video stores as-is

- [ ] **Step 5: Commit**

```bash
git add src/collections/hooks/optimizeVideo.ts src/collections/Media.ts src/payload.config.ts
git commit -m "feat: wire up video optimization hook and Payload Jobs Queue

afterChange hook queues optimizeVideo job when video is uploaded
or stripAudio is toggled. Jobs autoRun cron ensures background processing."
```

---

## Chunk 3: Frontend Integration (Blur Placeholders)

### Task 7: Add getBlurDataURL Helper

**Files:**
- Modify: `src/core/lib/utils.ts`

- [ ] **Step 1: Add the getBlurDataURL function**

In `src/core/lib/utils.ts`, add after `getMediaUrl`:

```ts
/** Extract blurDataURL from a Payload Media object for next/image placeholder. */
export function getBlurDataURL(
  media: string | { blurDataURL?: string } | undefined | null,
): string | undefined {
  if (!media || typeof media === "string") return undefined;
  return media.blurDataURL || undefined;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/core/lib/utils.ts
git commit -m "feat: add getBlurDataURL helper for next/image blur placeholders"
```

---

### Task 8: Update Hero Component

**Files:**
- Modify: `src/components/layout/hero/hero.tsx`

- [ ] **Step 1: Add blur placeholder support**

In `src/components/layout/hero/hero.tsx`:

1. Add `getBlurDataURL` to the import from `@/core/lib/utils`:
```ts
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
```

2. Update the `HeroProps` interface to include `blurDataURL` on the media object:
```ts
interface HeroProps {
  headline?: string;
  mediaSrc?: { url?: string; blurDataURL?: string } | string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  subtext?: string;
}
```

3. Extract blur data from the **raw prop** (not the resolved string). Add after line 22 (`const mediaSrc = getMediaUrl(props.mediaSrc) || heroData.mediaSrc;`):
```ts
const blurDataURL = getBlurDataURL(props.mediaSrc);
```

Important: Use `props.mediaSrc` (the raw Payload object), NOT `mediaSrc` (the resolved URL string).

4. Add blur props to the `Image` component:
```tsx
<Image
  alt="Hero background"
  blurDataURL={blurDataURL}
  className="object-cover"
  fill
  placeholder={blurDataURL ? "blur" : "empty"}
  priority
  src={mediaSrc}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/hero/hero.tsx
git commit -m "feat: add blur placeholder to Hero image"
```

---

### Task 9: Update ImageCard Component (Bento)

**Files:**
- Modify: `src/components/layout/bento/image-card.tsx`

- [ ] **Step 1: Add blur placeholder support**

In `src/components/layout/bento/image-card.tsx`:

1. Add `getBlurDataURL` to the import:
```ts
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
```

2. Update the `ImageCardProps` interface:
```ts
interface ImageCardProps {
  image?: {
    alt?: string;
    badge?: string;
    description?: string;
    src?: { url?: string; blurDataURL?: string } | string;
    title?: string;
  };
}
```

3. Extract blur data from the **raw prop** (after line 19, where `src` is resolved):
```ts
const blurDataURL = getBlurDataURL(image?.src);
```

4. Add blur props to the `Image` component:
```tsx
<Image
  alt={alt}
  blurDataURL={blurDataURL}
  className="object-cover brightness-75"
  fill
  placeholder={blurDataURL ? "blur" : "empty"}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  src={src}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/bento/image-card.tsx
git commit -m "feat: add blur placeholder to ImageCard (Bento)"
```

---

### Task 10: Update SplitMedia Component

**Files:**
- Modify: `src/components/layout/split-media/split-media.tsx`

The `SplitMedia` parent resolves media objects to plain URL strings in the `ResolvedRow` type before passing to `SplitRowItem`. We need to thread `blurDataURL` through the intermediate type.

- [ ] **Step 1: Update imports**

Add `getBlurDataURL` to the import:
```ts
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
```

- [ ] **Step 2: Add `blurDataURL` to the `ResolvedRow` interface**

```ts
interface ResolvedRow {
  body: string;
  cta?: { href: string; label: string };
  headline: string;
  mediaAlt: string;
  blurDataURL?: string;
  mediaLabel: string;
  mediaOverlay: { badge?: string; description: string; title: string };
  mediaSrc: string;
}
```

- [ ] **Step 3: Extract blur data in the parent mapping**

In the `SplitMedia` component's `props.rows.map()` call (line 228-243), add `blurDataURL` extraction from the raw `r.mediaSrc` object:

```ts
const rows: ResolvedRow[] =
  props.rows && props.rows.length > 0
    ? props.rows.map((r) => ({
        headline: r.headline,
        body: r.body,
        mediaLabel: r.mediaLabel,
        mediaSrc: getMediaUrl(r.mediaSrc),
        blurDataURL: getBlurDataURL(r.mediaSrc),
        mediaAlt: r.mediaAlt,
        cta:
          r.cta?.label && r.cta?.href
            ? { label: r.cta.label, href: r.cta.href }
            : undefined,
        mediaOverlay: {
          title: r.mediaOverlay.title,
          badge: r.mediaOverlay.badge,
          description: r.mediaOverlay.description,
        },
      }))
    : splitMediaRows;
```

- [ ] **Step 4: Add blur props to the Image in `SplitRowItem`**

In `SplitRowItem`, update the `Image` component (line 90-96):

```tsx
<Image
  alt={row.mediaAlt}
  blurDataURL={row.blurDataURL}
  className="object-cover brightness-75"
  fill
  placeholder={row.blurDataURL ? "blur" : "empty"}
  sizes="(max-width: 1024px) 100vw, 65vw"
  src={row.mediaSrc}
/>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/split-media/split-media.tsx
git commit -m "feat: add blur placeholder to SplitMedia images

Thread blurDataURL through ResolvedRow type so it's available
in SplitRowItem for next/image placeholder prop."
```

---

### Task 11: Update LatestArticles + ArticleCard

**Files:**
- Modify: `src/components/layout/latest-articles/latest-articles-data.ts` (Article interface)
- Modify: `src/components/layout/latest-articles/latest-articles.tsx` (parent mapping)
- Modify: `src/components/layout/latest-articles/article-card.tsx` (Image component)

The parent `LatestArticles` resolves `a.image` to `imageSrc: string` via `getMediaUrl()`. The `blurDataURL` is lost before `ArticleCard` receives it. We need to thread it through the `Article` type.

- [ ] **Step 1: Add `blurDataURL` to the Article interface**

In `src/components/layout/latest-articles/latest-articles-data.ts`, update the `Article` interface:

```ts
export interface Article {
  author: {
    name: string;
    avatarSrc: string;
  };
  blurDataURL?: string;
  category: string;
  excerpt: string;
  href: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  publishedAt: string;
  readTime: string;
  title: string;
}
```

- [ ] **Step 2: Extract blur data in the parent mapping**

In `src/components/layout/latest-articles/latest-articles.tsx`:

Add `getBlurDataURL` to the import:
```ts
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
```

Update the `props.articles.map()` call (line 46-61) to include `blurDataURL`:

```ts
const articles: Article[] = props.articles
  ? props.articles.map((a, i) => ({
      id: a.id || String(i),
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      imageSrc: getMediaUrl(a.image),
      blurDataURL: getBlurDataURL(a.image),
      imageAlt: a.imageAlt,
      author: {
        name: a.author.name,
        avatarSrc: getMediaUrl(a.author.avatar),
      },
      readTime: a.readTime,
      href: a.href,
      publishedAt: a.publishedAt,
    }))
  : [];
```

- [ ] **Step 3: Add blur props to Image components in ArticleCard**

In `src/components/layout/latest-articles/article-card.tsx`:

Update the featured variant `Image` (line 29-35):
```tsx
<Image
  alt={article.imageAlt}
  blurDataURL={article.blurDataURL}
  className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-110"
  fill
  placeholder={article.blurDataURL ? "blur" : "empty"}
  sizes="(max-width: 1024px) 100vw, 60vw"
  src={article.imageSrc}
/>
```

Update the supporting variant `Image` (line 75-81):
```tsx
<Image
  alt={article.imageAlt}
  blurDataURL={article.blurDataURL}
  className="object-cover brightness-[0.97] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:brightness-105"
  fill
  placeholder={article.blurDataURL ? "blur" : "empty"}
  sizes="(max-width: 1024px) 100vw, 40vw"
  src={article.imageSrc}
/>
```

Note: No new imports needed in `article-card.tsx` — `blurDataURL` comes from `article` prop, not extracted here.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/latest-articles/
git commit -m "feat: add blur placeholder to ArticleCard images

Thread blurDataURL through Article type from parent mapping
to both featured and supporting variants."
```

---

### Task 12: Update ImageGallery + GalleryCard

**Files:**
- Modify: `src/components/layout/image-gallery/image-gallery-data.ts` (GalleryItem interface)
- Modify: `src/components/layout/image-gallery/image-gallery.tsx` (parent mapping)
- Modify: `src/components/layout/image-gallery/gallery-card.tsx` (Image component)

Same pattern: the `toGalleryItem()` mapper resolves `item.image` to `imageSrc: string`, discarding `blurDataURL`.

- [ ] **Step 1: Add `blurDataURL` to the GalleryItem interface**

In `src/components/layout/image-gallery/image-gallery-data.ts`, update:

```ts
export interface GalleryItem {
  blurDataURL?: string;
  caption: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  label: string;
}
```

- [ ] **Step 2: Extract blur data in `toGalleryItem` mapper**

In `src/components/layout/image-gallery/image-gallery.tsx`:

Add `getBlurDataURL` to the import:
```ts
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
```

Update the `toGalleryItem` function (line 24-35):

```ts
function toGalleryItem(
  item: NonNullable<ImageGalleryProps["items"]>[number],
  index: number,
): GalleryItem {
  return {
    id: item.id || `g-${index}`,
    label: item.label,
    caption: item.caption,
    imageSrc: getMediaUrl(item.image),
    blurDataURL: getBlurDataURL(item.image),
    imageAlt: item.imageAlt,
  };
}
```

- [ ] **Step 3: Add blur props to Image in GalleryCard**

In `src/components/layout/image-gallery/gallery-card.tsx`, update the `Image` component (line 88-97):

```tsx
<Image
  alt={item.imageAlt}
  blurDataURL={item.blurDataURL}
  className="object-cover"
  fill
  loading={index <= 2 ? "eager" : undefined}
  onLoad={() => onImageLoad(index)}
  placeholder={item.blurDataURL ? "blur" : "empty"}
  priority={index <= 1}
  sizes="100vw"
  src={item.imageSrc}
/>
```

Note: No new imports needed in `gallery-card.tsx` — `blurDataURL` comes from `item` prop via the `GalleryItem` type.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/image-gallery/
git commit -m "feat: add blur placeholder to GalleryCard images

Thread blurDataURL through GalleryItem type from toGalleryItem
mapper to the GalleryCard Image component."
```

---

### Task 13: Final Verification

- [ ] **Step 1: Run lint check**

Run: `bun check`

Fix any issues found.

- [ ] **Step 2: Run build**

Run: `bun build`

Verify no TypeScript errors or build failures.

- [ ] **Step 3: Full end-to-end verification**

Run: `bun dev`

1. Upload a large JPG/PNG image (>2MB) via admin panel
2. Verify in admin: image shows as WebP, thumbnail/card/hero variants visible
3. Check API response (`/api/media/<id>`): `blurDataURL` field is present
4. Navigate to a frontend page using the image — verify blur placeholder shows briefly before image loads
5. If ffmpeg is available: upload a large video, check server logs for job processing
6. Note: blur placeholders only work for CMS-sourced media, not static fallback/demo data

- [ ] **Step 4: Final commit (if lint fixes were needed)**

```bash
git add -A
git commit -m "chore: fix lint issues from media optimization implementation"
```
