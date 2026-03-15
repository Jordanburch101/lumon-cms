import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

interface RevalidateOptions {
  /** Additional static tags to invalidate on every change */
  tags?: string[];
}

/**
 * Creates afterChange and afterDelete hooks that invalidate cache tags
 * for a document and its collection. Attach to any Payload collection.
 *
 * Tag conventions:
 *  - `doc:{collection}:{id}` — specific document
 *  - `collection:{collection}` — all documents in a collection
 *
 * Set `context.disableRevalidate = true` to skip (loop prevention).
 */
export function revalidateOnChange(options: RevalidateOptions = {}): {
  afterChange: CollectionAfterChangeHook;
  afterDelete: CollectionAfterDeleteHook;
} {
  const afterChange: CollectionAfterChangeHook = ({
    doc,
    collection,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc;
    }

    const collectionSlug = collection.slug;

    payload.logger.info({
      msg: `Revalidating doc:${collectionSlug}:${doc.id}`,
    });

    try {
      revalidateTag(`doc:${collectionSlug}:${doc.id}`, "default");
      revalidateTag(`collection:${collectionSlug}`, "default");

      for (const tag of options.tags ?? []) {
        revalidateTag(tag, "default");
      }
    } catch (err) {
      payload.logger.error({
        msg: `Cache revalidation failed for doc:${collectionSlug}:${doc.id}`,
        err,
      });
    }

    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = ({
    doc,
    collection,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc;
    }

    const collectionSlug = collection.slug;

    payload.logger.info({
      msg: `Revalidating (delete) doc:${collectionSlug}:${doc.id}`,
    });

    try {
      revalidateTag(`doc:${collectionSlug}:${doc.id}`, "default");
      revalidateTag(`collection:${collectionSlug}`, "default");

      for (const tag of options.tags ?? []) {
        revalidateTag(tag, "default");
      }
    } catch (err) {
      payload.logger.error({
        msg: `Cache revalidation failed for doc:${collectionSlug}:${doc.id}`,
        err,
      });
    }

    return doc;
  };

  return { afterChange, afterDelete };
}
