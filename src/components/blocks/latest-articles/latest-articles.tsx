import { getCachedArticles } from "@/payload/lib/cached-payload";
import type { LatestArticlesBlock } from "@/types/block-types";
import { LatestArticlesClient } from "./latest-articles-client";

export async function LatestArticles({
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
