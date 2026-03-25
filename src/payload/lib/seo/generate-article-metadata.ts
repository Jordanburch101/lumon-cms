import type { Metadata } from "next";
import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import type { Article, Media, SiteSetting } from "@/payload-types";

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
  let url = media.url;
  const isAbsolute =
    media.url.startsWith("http://") || media.url.startsWith("https://");
  if (!isAbsolute && baseUrl) {
    url = `${baseUrl}${media.url}`;
  }
  return { url, width: media.width, height: media.height };
}

export function generateArticleMetadata(
  article: Article,
  settings: SiteSetting
): Metadata {
  const isDraft = article._status === "draft";
  const siteName = settings.siteName?.trim() || undefined;
  const separator = settings.separator || " | ";
  const title =
    article.meta?.title ||
    (siteName ? `${article.title}${separator}${siteName}` : article.title);
  const description = article.meta?.description || article.excerpt || undefined;
  const baseUrl = settings.baseUrl || undefined;
  const canonical = baseUrl
    ? `${baseUrl}/blog/${article.slug}`.replace(TRAILING_SLASH_RE, "")
    : undefined;

  const heroResolved = resolveMediaUrl(
    article.heroImage as number | Media,
    baseUrl
  );
  const metaResolved = resolveMediaUrl(
    article.meta?.image as number | Media | undefined,
    baseUrl
  );
  const ogImage = metaResolved || heroResolved;

  return {
    title,
    description,
    keywords: article.meta?.keywords || undefined,
    alternates: canonical ? { canonical } : undefined,
    robots: isDraft ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical || undefined,
      siteName: settings.siteName || undefined,
      type: "article",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage.url,
                ...(ogImage.width ? { width: ogImage.width } : {}),
                ...(ogImage.height ? { height: ogImage.height } : {}),
              },
            ],
          }
        : {}),
    },
  };
}
