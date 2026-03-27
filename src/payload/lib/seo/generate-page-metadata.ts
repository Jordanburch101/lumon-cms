import type { Metadata } from "next";
import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import type { Media, Page, SiteSetting } from "@/payload-types";
import { extractFirstTextFromBlocks } from "./extract-block-content";

/** Ensure a URL is absolute — prepend baseUrl if it's a relative path. */
function toAbsoluteUrl(url: string, baseUrl: string | undefined): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return baseUrl ? `${baseUrl}${url}` : url;
}

/** Resolve a media field that may be a number (unpopulated) or object (populated). */
function resolveMediaUrl(
  media: number | Media | null | undefined,
  baseUrl: string | undefined
): { url: string; width?: number | null; height?: number | null } | undefined {
  if (!media || typeof media === "number") {
    return undefined;
  }
  if (!media.url) {
    return undefined;
  }
  return {
    url: toAbsoluteUrl(media.url, baseUrl),
    width: media.width,
    height: media.height,
  };
}

function buildRobots(
  page: Page,
  settings: SiteSetting,
  isDraft: boolean
): Metadata["robots"] {
  if (isDraft) {
    return { index: false, follow: false };
  }
  if (page.meta?.robots?.override) {
    return {
      index: page.meta.robots.index ?? true,
      follow: page.meta.robots.follow ?? true,
    };
  }
  return {
    index: settings.robots?.index ?? true,
    follow: settings.robots?.follow ?? true,
  };
}

function buildOgImages(
  metaResolved: ReturnType<typeof resolveMediaUrl>,
  defaultResolved: ReturnType<typeof resolveMediaUrl>
) {
  const image = metaResolved || defaultResolved;
  if (!image) {
    return undefined;
  }
  return [
    {
      url: image.url,
      ...(image.width ? { width: image.width } : {}),
      ...(image.height ? { height: image.height } : {}),
    },
  ];
}

/**
 * Merges page SEO fields + SiteSettings into a complete Next.js Metadata object.
 * Draft pages always get noindex/nofollow regardless of settings.
 */
export function generatePageMetadata(
  page: Page,
  settings: SiteSetting
): Metadata {
  const isDraft = page._status === "draft";

  // Title: page meta → fallback to "{title}{separator}{siteName}"
  // Guard against empty siteName to avoid trailing separator ("About | ")
  const siteName = settings.siteName?.trim() || undefined;
  const separator = settings.separator || " | ";
  const title =
    page.meta?.title ||
    (siteName ? `${page.title}${separator}${siteName}` : page.title);

  // Description: meta field → fallback to first text extracted from blocks
  const description =
    page.meta?.description ||
    extractFirstTextFromBlocks([
      ...((page.hero as Parameters<typeof extractFirstTextFromBlocks>[0]) ??
        []),
      ...((page.layout as Parameters<typeof extractFirstTextFromBlocks>[0]) ??
        []),
    ]) ||
    undefined;

  // Images — resolve populated media objects and ensure absolute URLs
  const baseUrl = settings.baseUrl || undefined;
  const metaResolved = resolveMediaUrl(page.meta?.image, baseUrl);
  const defaultResolved = resolveMediaUrl(settings.defaultOgImage, baseUrl);
  const ogImages = buildOgImages(metaResolved, defaultResolved);
  const ogImageUrl = metaResolved?.url || defaultResolved?.url || undefined;

  // Canonical: auto-generated from baseUrl/path
  const urlPath = (page.path ?? page.slug) || "";
  const canonical = settings.baseUrl
    ? `${settings.baseUrl}/${urlPath}`.replace(TRAILING_SLASH_RE, "")
    : undefined;

  return {
    title,
    description,
    keywords: page.meta?.keywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: buildRobots(page, settings, isDraft),
    openGraph: {
      title,
      description: description || undefined,
      url: canonical || undefined,
      siteName: settings.siteName || undefined,
      ...(ogImages ? { images: ogImages } : {}),
      type: "website",
    },
    twitter: {
      card: settings.social?.twitterCardType || "summary_large_image",
      ...(settings.social?.twitter ? { site: settings.social.twitter } : {}),
      title,
      description: description || undefined,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
