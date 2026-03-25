import type { CollectionAfterDeleteHook } from "payload";

/**
 * When a parent page is deleted, resaves orphaned children with `parent: null`
 * so they become top-level pages. Their paths recompute via `computePath`.
 */
export const reparentOnDelete: CollectionAfterDeleteHook = async ({
  id,
  req,
}) => {
  const children = await req.payload.find({
    collection: "pages",
    where: { parent: { equals: id } },
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
        data: { parent: null },
        context: { cascadingPaths: true },
        req,
      })
    )
  );
};
