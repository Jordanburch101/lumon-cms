import type { CollectionAfterChangeHook } from "payload";

/**
 * After a page's path changes, resaves all direct children so their paths
 * recompute via `computePath`. The cascade terminates naturally when a page
 * has no children.
 *
 * Set `context.cascadingPaths = true` on triggered updates so downstream
 * hooks can detect they are part of a cascade if needed.
 */
export const cascadeChildPaths: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (previousDoc?.path === doc.path) {
    return doc;
  }

  const children = await req.payload.find({
    collection: "pages",
    where: { parent: { equals: doc.id } },
    select: { id: true },
    pagination: false,
    depth: 0,
    req,
  });

  await Promise.all(
    children.docs.map((child) =>
      req.payload.update({
        collection: "pages",
        id: child.id,
        data: {},
        context: { cascadingPaths: true },
        req,
      })
    )
  );

  return doc;
};
