import { describe, expect, it, mock } from "bun:test";

// Stub next/cache before any module import
mock.module("next/cache", () => ({
  cacheTag: (..._tags: string[]) => {
    // intentional no-op stub
  },
  cacheLife: (_profile: string) => {
    // intentional no-op stub
  },
  revalidateTag: (_tag: string, _profile: string) => {
    // intentional no-op stub
  },
}));

// Stub payload and react so the module can load in a test environment
mock.module("payload", () => ({
  getPayload: async () => ({}),
}));

mock.module("react", () => ({
  cache: (fn: unknown) => fn,
}));

// @payload-config resolves to src/payload.config.ts via tsconfig paths alias
mock.module("@payload-config", () => ({ default: {} }));

mock.module(
  "/Users/jordanburch/Documents/work-files/--nextjs--/lumon-payload/src/payload/lib/relationship-walker/index.ts",
  () => ({
    tagResolvedRelationships: () => {
      // intentional no-op stub
    },
  })
);

const { shouldExcludeDoc, buildDocEntry } = await import(".");

describe("shouldExcludeDoc", () => {
  it("excludes when excludeFromSitemap is true", () => {
    expect(shouldExcludeDoc({ excludeFromSitemap: true }, false)).toBe(true);
  });

  it("excludes when per-item robots override has noindex", () => {
    expect(
      shouldExcludeDoc({ robots: { override: true, index: false } }, false)
    ).toBe(true);
  });

  it("excludes when no override and global is noindex", () => {
    expect(shouldExcludeDoc({ robots: { override: false } }, true)).toBe(true);
  });

  it("excludes when meta is undefined and global is noindex", () => {
    expect(shouldExcludeDoc(undefined, true)).toBe(true);
  });

  it("includes when excludeFromSitemap is false and robots allow", () => {
    expect(shouldExcludeDoc({ excludeFromSitemap: false }, false)).toBe(false);
  });

  it("includes when per-item robots override has index=true even if global is noindex", () => {
    expect(
      shouldExcludeDoc({ robots: { override: true, index: true } }, true)
    ).toBe(false);
  });

  it("includes when no meta at all and global allows indexing", () => {
    expect(shouldExcludeDoc(undefined, false)).toBe(false);
  });

  it("includes when meta is present but no relevant exclusion flags", () => {
    expect(shouldExcludeDoc({}, false)).toBe(false);
  });
});

describe("buildDocEntry", () => {
  it("builds URL from baseUrl + urlPrefix + slug", () => {
    const entry = buildDocEntry(
      { slug: "about", updatedAt: "2024-01-15T10:00:00Z" },
      "https://example.com",
      ""
    );
    expect(entry.url).toBe("https://example.com/about");
  });

  it("home page slug produces URL without trailing slash", () => {
    const entry = buildDocEntry(
      { slug: "home", updatedAt: "2024-01-15T10:00:00Z" },
      "https://example.com",
      ""
    );
    // slug "home" → path "" → url should not end with "/"
    expect(entry.url).toBe("https://example.com");
  });

  it("uses urlPrefix in the URL", () => {
    const entry = buildDocEntry(
      { slug: "my-post", updatedAt: "2024-03-01T00:00:00Z" },
      "https://example.com",
      "/blog"
    );
    expect(entry.url).toBe("https://example.com/blog/my-post");
  });

  it("empty urlPrefix works correctly", () => {
    const entry = buildDocEntry({ slug: "contact" }, "https://example.com", "");
    expect(entry.url).toBe("https://example.com/contact");
  });

  it("sets lastModified from updatedAt", () => {
    const updatedAt = "2024-06-20T12:30:00Z";
    const entry = buildDocEntry(
      { slug: "page", updatedAt },
      "https://x.com",
      ""
    );
    expect(entry.lastModified).toBeInstanceOf(Date);
    expect(entry.lastModified?.toISOString()).toBe(
      new Date(updatedAt).toISOString()
    );
  });

  it("handles missing updatedAt — lastModified is undefined", () => {
    const entry = buildDocEntry({ slug: "page" }, "https://x.com", "");
    expect(entry.lastModified).toBeUndefined();
  });

  it("handles missing slug — treats as empty string", () => {
    const entry = buildDocEntry({}, "https://example.com", "/blog");
    // slug undefined → path "" (not "home" special case) → url ends without trailing slash
    expect(entry.url).toBe("https://example.com/blog");
  });
});
