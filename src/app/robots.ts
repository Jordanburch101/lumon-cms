import type { MetadataRoute } from "next";
import { getCachedSiteSettings } from "@/payload/lib/cached-payload";

const TRAILING_SLASH_RE = /\/$/;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getCachedSiteSettings();
  const baseUrl = (settings.baseUrl || "").replace(TRAILING_SLASH_RE, "");
  const globalIndex = settings.robots?.index ?? true;

  // robots.txt only controls crawl access (Allow/Disallow).
  // The "follow" directive is a per-page <meta> concern, not robots.txt.
  return {
    rules: {
      userAgent: "*",
      ...(globalIndex ? { allow: "/" } : { disallow: "/" }),
      disallow: ["/admin", "/api"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
