import { getCachedArticles } from "@/payload/lib/cached-payload";
import type { LatestArticlesBlock } from "@/types/block-types";
import { LatestArticlesClient } from "./latest-articles-client";

/**
 * Async server version of LatestArticles that fetches from the Articles collection.
 * Used by RenderBlocksServer (server-only page routes), NOT by render-blocks.tsx
 * (which is also imported by the "use client" preview-client).
 */
export async function LatestArticlesServer({
  headline,
  subtext,
  limit,
}: LatestArticlesBlock) {
  const result = await getCachedArticles(1, limit || 5);
  const articles = result.docs;

  if (articles.length === 0) {
    return null;
  }

  return (
    <LatestArticlesClient
      articles={articles}
      headline={headline}
      subtext={subtext}
    />
  );
}
