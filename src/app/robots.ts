import type { MetadataRoute } from "next";
import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import { getCachedSiteSettings } from "@/payload/lib/cached-payload";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getCachedSiteSettings();
  const baseUrl = (settings.baseUrl || "").replace(TRAILING_SLASH_RE, "");
  const globalIndex = settings.robots?.index ?? true;

  // robots.txt only controls crawl access (Allow/Disallow).
  // The "follow" directive is a per-page <meta> concern, not robots.txt.
  return {
    rules: {
      userAgent: "*",
      ...(globalIndex ? { allow: "/" } : {}),
      disallow: globalIndex ? ["/admin", "/api"] : "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
