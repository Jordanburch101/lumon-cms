import config from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
import { getPayload } from "payload";
import { cache } from "react";
import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import { tagResolvedRelationships } from "../relationship-walker";

/**
 * Fetch a page by slug with caching and relationship tagging.
 * Uses Next.js `'use cache'` — invalidated via `revalidateTag`.
 * Wrapped in React `cache()` to deduplicate within a single request
 * (called from both generateMetadata and the Page component).
 */
export const getCachedPage = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { path: { equals: slug } },
    draft: false,
    limit: 1,
  });

  const page = result.docs[0] ?? null;

  if (page) {
    cacheTag("collection:pages", `doc:pages:${page.id}`);
    tagResolvedRelationships(page);
  }

  return page;
});

/**
 * Fetch a page by slug WITHOUT caching. Used for draft/preview mode.
 */
export async function getPageDirect(slug: string, draft = false) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { path: { equals: slug } },
    draft,
    limit: 1,
  });

  return result.docs[0] ?? null;
}

/**
 * Fetch SiteSettings global with caching.
 * Uses Next.js `'use cache'` — invalidated when SiteSettings changes.
 * Wrapped in React `cache()` to deduplicate within a single request
 * (e.g., when called from both generateMetadata and the Page component).
 */
export const getCachedSiteSettings = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("site-settings");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "site-settings" });
});

export const getCachedHeader = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("header");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "header" });
});

export const getCachedFooter = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("footer");

  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "footer" });
});

// ── Articles ────────────────────────────────────────────────────────

/**
 * Fetch a single article by slug with caching and relationship tagging.
 */
export const getCachedArticle = cache(async (slug: string) => {
  "use cache";
  cacheLife("hours");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    draft: false,
    limit: 1,
    depth: 2,
  });

  const article = result.docs[0] ?? null;

  if (article) {
    cacheTag("collection:articles", `doc:articles:${article.id}`);
    tagResolvedRelationships(article);
  }

  return article;
});

/**
 * Fetch a single article by slug WITHOUT caching. Used for draft/preview mode.
 */
export async function getArticleDirect(slug: string, draft = false) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    draft,
    limit: 1,
    depth: 2,
  });

  return result.docs[0] ?? null;
}

/**
 * Fetch paginated articles with optional category filter.
 */
export const getCachedArticles = cache(
  async (page = 1, limit = 9, categorySlug?: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag("collection:articles", "collection:categories");

    const payload = await getPayload({ config });

    const where: { category?: { equals: number } } = {};

    if (categorySlug) {
      // Resolve category ID from slug first
      const catResult = await payload.find({
        collection: "categories",
        where: { slug: { equals: categorySlug } },
        limit: 1,
        select: { slug: true },
      });
      const catId = catResult.docs[0]?.id;
      if (catId) {
        where.category = { equals: catId };
      }
    }

    const result = await payload.find({
      collection: "articles",
      where,
      draft: false,
      sort: "-publishedAt",
      page,
      limit,
      depth: 2,
    });

    return result;
  }
);

/**
 * Fetch all categories.
 */
export const getCachedCategories = cache(async () => {
  "use cache";
  cacheLife("hours");
  cacheTag("collection:categories");

  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "categories",
    pagination: false,
    sort: "title",
  });

  return result.docs;
});

interface SitemapEntry {
  lastModified?: Date;
  url: string;
}

interface DocMeta {
  excludeFromSitemap?: boolean;
  robots?: { override?: boolean; index?: boolean };
}

interface SitemapDoc {
  meta?: DocMeta;
  path?: string;
  slug?: string;
  updatedAt?: string;
}

interface CollectionCustom {
  sitemap?: { enabled?: boolean; urlPrefix?: string };
}

export function shouldExcludeDoc(
  meta: DocMeta | undefined,
  globalNoIndex: boolean
): boolean {
  if (meta?.excludeFromSitemap) {
    return true;
  }
  if (meta?.robots?.override && meta.robots.index === false) {
    return true;
  }
  if (!meta?.robots?.override && globalNoIndex) {
    return true;
  }
  return false;
}

export function buildDocEntry(
  doc: SitemapDoc,
  baseUrl: string,
  urlPrefix: string
): SitemapEntry {
  const pagePath = (doc as { path?: string }).path ?? doc.slug ?? "";
  return {
    url: `${baseUrl}${urlPrefix}/${pagePath}`.replace(TRAILING_SLASH_RE, ""),
    lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  };
}

/**
 * Fetch all sitemap entries from auto-discovered collections.
 * Cached and tagged with "sitemap" — revalidated when any page changes.
 */
export async function getCachedSitemapData() {
  "use cache";
  cacheLife("hours");
  cacheTag("sitemap", "site-settings");

  const payload = await getPayload({ config });
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const baseUrl = (settings.baseUrl || "").replace(TRAILING_SLASH_RE, "");
  const globalNoIndex = settings.robots?.index === false;

  // Auto-discover collections with sitemap enabled
  const sitemapCollections = payload.config.collections.filter(
    (c) => (c.custom as CollectionCustom)?.sitemap?.enabled === true
  );

  const entries: SitemapEntry[] = [];

  for (const collection of sitemapCollections) {
    const urlPrefix =
      (collection.custom as CollectionCustom)?.sitemap?.urlPrefix ?? "";

    const result = await payload.find({
      collection: collection.slug,
      draft: false,
      pagination: false,
      select: { slug: true, path: true, updatedAt: true, meta: true },
    });

    for (const rawDoc of result.docs) {
      const doc = rawDoc as SitemapDoc;
      if (shouldExcludeDoc(doc.meta, globalNoIndex)) {
        continue;
      }
      entries.push(buildDocEntry(doc, baseUrl, urlPrefix));
    }
  }

  return entries;
}
