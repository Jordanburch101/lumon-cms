import type { Metadata } from "next";
import type { Media, Page, SiteSetting } from "@/payload-types";

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
  metaImage: Media | null | undefined,
  defaultImage: Media | null | undefined
) {
  const url = metaImage?.url || defaultImage?.url;
  if (!url) {
    return undefined;
  }
  return [
    {
      url,
      ...(metaImage?.width ? { width: metaImage.width } : {}),
      ...(metaImage?.height ? { height: metaImage.height } : {}),
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
  const separator = settings.separator || " | ";
  const title =
    page.meta?.title || `${page.title}${separator}${settings.siteName || ""}`;

  // Description
  const description = page.meta?.description || undefined;

  // Images
  const metaImage = page.meta?.image as Media | null | undefined;
  const defaultImage = settings.defaultOgImage as Media | null | undefined;
  const ogImages = buildOgImages(metaImage, defaultImage);
  const ogImageUrl = metaImage?.url || defaultImage?.url || undefined;

  // Canonical: custom override → fallback to baseUrl/slug
  const slug = page.slug === "home" ? "" : page.slug;
  const canonical =
    page.meta?.canonicalUrl ||
    (settings.baseUrl ? `${settings.baseUrl}/${slug}` : undefined);

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
