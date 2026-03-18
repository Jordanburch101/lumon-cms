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
    where: { slug: { equals: slug } },
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
    where: { slug: { equals: slug } },
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
  slug?: string;
  updatedAt?: string;
}

interface CollectionCustom {
  sitemap?: { enabled?: boolean; urlPrefix?: string };
}

function shouldExcludeDoc(
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

function buildDocEntry(
  doc: SitemapDoc,
  baseUrl: string,
  urlPrefix: string
): SitemapEntry {
  const slug = doc.slug ?? "";
  const path = slug === "home" ? "" : slug;
  return {
    url: `${baseUrl}${urlPrefix}/${path}`.replace(TRAILING_SLASH_RE, ""),
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
      select: { slug: true, updatedAt: true, meta: true },
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
