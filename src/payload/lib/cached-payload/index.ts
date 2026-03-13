import config from "@payload-config";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

/**
 * Fetch a page by slug with caching.
 *
 * Uses `unstable_cache` with per-slug cache keys and the `collection:pages` tag
 * for broad invalidation. Individual page revalidation happens via
 * `revalidateTag('collection:pages')` in the afterChange hook.
 */
export const getCachedPage = unstable_cache(
  async (slug: string) => {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      draft: false,
      limit: 1,
    });

    return result.docs[0] ?? null;
  },
  ["pages"],
  {
    revalidate: 3600,
    tags: ["collection:pages"],
  }
);

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
