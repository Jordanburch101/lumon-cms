import type { MetadataRoute } from "next";
import { getCachedSitemapData } from "@/payload/lib/cached-payload";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getCachedSitemapData();
}
