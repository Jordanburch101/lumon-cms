import { beforeEach, describe, expect, it, mock } from "bun:test";

const revalidatedTags: Array<{ tag: string; profile: string }> = [];

mock.module("next/cache", () => ({
  revalidateTag: (tag: string, profile: string) => {
    revalidatedTags.push({ tag, profile });
  },
  // Stub other next/cache exports so co-loaded modules don't break
  cacheTag: (..._tags: string[]) => {
    // intentional no-op stub
  },
  cacheLife: (_profile: string) => {
    // intentional no-op stub
  },
}));

const { revalidateOnChange } = await import("./revalidateOnChange");

/** Minimal stub matching what the hook destructures */
function makeHookArgs(
  overrides: {
    id?: number;
    collectionSlug?: string;
    disableRevalidate?: boolean;
  } = {}
) {
  const doc = { id: overrides.id ?? 1 };
  return {
    doc,
    collection: { slug: overrides.collectionSlug ?? "pages" },
    req: {
      payload: {
        logger: {
          info: () => {
            // intentional no-op stub
          },
        },
      },
      context: {
        disableRevalidate: overrides.disableRevalidate ?? false,
      },
    },
  } as unknown as Parameters<
    ReturnType<typeof revalidateOnChange>["afterChange"]
  >[0];
}

describe("revalidateOnChange", () => {
  beforeEach(() => {
    revalidatedTags.length = 0;
  });

  describe("afterChange", () => {
    it("fires doc and collection tags", () => {
      const { afterChange } = revalidateOnChange();
      afterChange(makeHookArgs({ id: 42, collectionSlug: "pages" }));

      expect(revalidatedTags).toEqual([
        { tag: "doc:pages:42", profile: "default" },
        { tag: "collection:pages", profile: "default" },
      ]);
    });

    it("skips revalidation when disableRevalidate is true", () => {
      const { afterChange } = revalidateOnChange();
      afterChange(makeHookArgs({ disableRevalidate: true }));

      expect(revalidatedTags).toHaveLength(0);
    });

    it("fires custom static tags", () => {
      const { afterChange } = revalidateOnChange({ tags: ["nav", "footer"] });
      afterChange(makeHookArgs({ id: 1, collectionSlug: "pages" }));

      expect(revalidatedTags).toEqual([
        { tag: "doc:pages:1", profile: "default" },
        { tag: "collection:pages", profile: "default" },
        { tag: "nav", profile: "default" },
        { tag: "footer", profile: "default" },
      ]);
    });

    it("returns the document", () => {
      const { afterChange } = revalidateOnChange();
      const args = makeHookArgs({ id: 1 });
      const result = afterChange(args);

      expect(result).toEqual({ id: 1 });
    });
  });

  describe("afterDelete", () => {
    it("fires doc and collection tags", () => {
      const { afterDelete } = revalidateOnChange();
      afterDelete(
        makeHookArgs({
          id: 7,
          collectionSlug: "media",
        }) as unknown as Parameters<
          ReturnType<typeof revalidateOnChange>["afterDelete"]
        >[0]
      );

      expect(revalidatedTags).toEqual([
        { tag: "doc:media:7", profile: "default" },
        { tag: "collection:media", profile: "default" },
      ]);
    });

    it("skips revalidation when disableRevalidate is true", () => {
      const { afterDelete } = revalidateOnChange();
      afterDelete(
        makeHookArgs({ disableRevalidate: true }) as unknown as Parameters<
          ReturnType<typeof revalidateOnChange>["afterDelete"]
        >[0]
      );

      expect(revalidatedTags).toHaveLength(0);
    });
  });
});
