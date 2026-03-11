import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

const taggedValues: string[] = [];

mock.module("next/cache", () => ({
  cacheTag: (...tags: string[]) => {
    taggedValues.push(...tags);
  },
  cacheLife: (_profile: string) => {
    // intentional no-op stub
  },
}));

const { tagResolvedRelationships } = await import("./relationship-walker");

describe("tagResolvedRelationships", () => {
  beforeEach(() => {
    taggedValues.length = 0;
  });

  it("tags a simple relationship field", () => {
    tagResolvedRelationships({
      id: 1,
      relationTo: "team-members",
      name: "Irving",
    });
    expect(taggedValues).toEqual(["doc:team-members:1"]);
  });

  it("tags a media upload field", () => {
    tagResolvedRelationships({
      id: 5,
      url: "/media/photo.jpg",
      mimeType: "image/jpeg",
      alt: "Photo",
    });
    expect(taggedValues).toEqual(["doc:media:5"]);
  });

  it("tags nested relations inside blocks", () => {
    tagResolvedRelationships({
      id: 10,
      title: "Page",
      layout: [
        {
          blockType: "hero",
          image: {
            id: 3,
            url: "/media/hero.jpg",
            mimeType: "image/jpeg",
          },
        },
      ],
    });
    expect(taggedValues).toContain("doc:media:3");
  });

  it("tags multiple relations", () => {
    tagResolvedRelationships({
      id: 10,
      title: "Page",
      hero: { id: 1, url: "/a.jpg", mimeType: "image/jpeg" },
      author: { id: 2, relationTo: "users" },
      gallery: [
        { id: 3, url: "/b.jpg", mimeType: "image/png" },
        { id: 4, url: "/c.jpg", mimeType: "image/jpeg" },
      ],
      reviewer: { id: 5, relationTo: "users" },
    });
    expect(taggedValues).toHaveLength(5);
    expect(taggedValues).toContain("doc:media:1");
    expect(taggedValues).toContain("doc:users:2");
    expect(taggedValues).toContain("doc:media:3");
    expect(taggedValues).toContain("doc:media:4");
    expect(taggedValues).toContain("doc:users:5");
  });

  it("handles circular references without infinite loop", () => {
    const a: Record<string, unknown> = {
      id: 1,
      relationTo: "nodes",
    };
    const b: Record<string, unknown> = {
      id: 2,
      relationTo: "nodes",
      ref: a,
    };
    a.ref = b;

    tagResolvedRelationships({ root: a });
    expect(taggedValues).toContain("doc:nodes:1");
    expect(taggedValues).toContain("doc:nodes:2");
    expect(taggedValues).toHaveLength(2);
  });

  it("does not tag objects without relationTo or url+mimeType", () => {
    tagResolvedRelationships({
      id: 99,
      title: "Just a page",
      slug: "home",
      nested: { id: 50, name: "plain object" },
    });
    expect(taggedValues).toEqual([]);
  });

  it("tags array of relations", () => {
    tagResolvedRelationships({
      members: [
        { id: 1, relationTo: "users" },
        { id: 2, relationTo: "users" },
      ],
    });
    expect(taggedValues).toEqual(["doc:users:1", "doc:users:2"]);
  });

  it("tags deeply nested relations", () => {
    tagResolvedRelationships({
      a: { b: { c: { d: { e: { id: 7, relationTo: "deep" } } } } },
    });
    expect(taggedValues).toEqual(["doc:deep:7"]);
  });

  it("warns when tag count exceeds 100", () => {
    const warnSpy = spyOn(console, "warn").mockImplementation(() => {
      // intentional no-op stub
    });

    const relations: Record<string, unknown> = {};
    for (let i = 0; i < 101; i++) {
      relations[`rel${i}`] = { id: i, relationTo: "items" };
    }
    tagResolvedRelationships(relations);

    expect(taggedValues).toHaveLength(101);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain("High tag count");

    warnSpy.mockRestore();
  });
});
