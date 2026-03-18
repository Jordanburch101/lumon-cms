import { revalidateTag } from "next/cache";
import type { GlobalAfterChangeHook } from "payload";

/**
 * Creates an afterChange hook for globals that revalidates the given cache tags.
 * Globals are singletons so no doc/collection-based tags are needed.
 */
export function revalidateGlobalOnChange(
  tags: string[]
): GlobalAfterChangeHook {
  return ({ global, req: { payload, context } }) => {
    if (context.disableRevalidate) {
      return;
    }

    try {
      for (const tag of tags) {
        revalidateTag(tag, "default");
      }
      payload.logger.info({ msg: `Revalidated global:${global.slug}` });
    } catch (err) {
      payload.logger.error({
        msg: `Cache revalidation failed for global:${global.slug}`,
        err,
      });
    }
  };
}
