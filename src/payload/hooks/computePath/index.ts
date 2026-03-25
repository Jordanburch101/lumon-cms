import type { CollectionBeforeChangeHook } from "payload";

/**
 * Computes the `path` field by walking the parent chain.
 *
 * - "home" slug → path = "" (root)
 * - No parent   → path = slug
 * - Has parent  → path = parent.path/slug
 *
 * Always pass depth: 0 to avoid populating unneeded relations.
 */
export const computePath: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  const slug: string = data.slug ?? originalDoc?.slug ?? "";

  if (slug === "home") {
    data.path = "";
    return data;
  }

  // Parent may be a populated object with `.id` or a raw number/string id
  const rawParent = data.parent ?? originalDoc?.parent;
  const parentId =
    rawParent && typeof rawParent === "object" ? rawParent.id : rawParent;

  if (!parentId) {
    data.path = slug;
    return data;
  }

  const parent = await req.payload.findByID({
    collection: "pages",
    id: parentId,
    select: { path: true, slug: true },
    depth: 0,
    req,
  });

  const parentPath = parent.path ?? parent.slug;
  data.path = parentPath ? `${parentPath}/${slug}` : slug;

  return data;
};
