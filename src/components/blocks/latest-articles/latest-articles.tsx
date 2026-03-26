import type { LatestArticlesBlock } from "@/types/block-types";
import { LatestArticlesClient } from "./latest-articles-client";

/**
 * LatestArticles — renders the client animation wrapper with empty articles.
 *
 * This synchronous wrapper is used by render-blocks.tsx which is imported by
 * preview-client.tsx ("use client"). The async data-fetching version is in
 * latest-articles-server.tsx and used by RenderBlocksServer.
 *
 * In preview mode this shows nothing (no articles). On real pages,
 * RenderBlocksServer substitutes the async version.
 */
export function LatestArticles({ headline, subtext }: LatestArticlesBlock) {
  return (
    <LatestArticlesClient articles={[]} headline={headline} subtext={subtext} />
  );
}
