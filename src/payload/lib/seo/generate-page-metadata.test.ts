import { describe, expect, it } from "bun:test";
import { generatePageMetadata } from "./generate-page-metadata";

// ── Minimal stubs ────────────────────────────────────────────────────
// We use `as any` at the call site so we can pass lightweight objects
// instead of importing the full Payload generated types.

function makePage(overrides: Record<string, unknown> = {}): any {
  return {
    id: 1,
    title: "About Us",
    slug: "about",
    _status: "published",
    ...overrides,
  };
}

function makeSettings(overrides: Record<string, unknown> = {}): any {
  return {
    id: 1,
    siteName: "Lumon Industries",
    baseUrl: "https://lumon.com",
    separator: " | ",
    robots: { index: true, follow: true },
    ...overrides,
  };
}

function makeMedia(
  id: number,
  url: string,
  overrides: Record<string, unknown> = {}
): any {
  return { id, url, width: 1200, height: 630, ...overrides };
}

// ── toAbsoluteUrl (tested indirectly through generatePageMetadata) ───

describe("toAbsoluteUrl (via canonical / OG image URL)", () => {
  it("absolute URLs pass through unchanged", () => {
    const page = makePage({
      meta: {
        canonicalUrl: "https://example.com/custom-canonical",
      },
    });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.alternates?.canonical).toBe(
      "https://example.com/custom-canonical"
    );
  });

  it("relative media URL gets baseUrl prepended", () => {
    const page = makePage({
      meta: {
        image: makeMedia(1, "/media/og.jpg"),
      },
    });
    const result = generatePageMetadata(page, makeSettings());
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://lumon.com/media/og.jpg");
  });
});

// ── resolveMediaUrl (tested indirectly via OG images) ───────────────

describe("resolveMediaUrl (via generatePageMetadata OG images)", () => {
  it("returns no OG image for unpopulated number media", () => {
    const page = makePage({ meta: { image: 5 } });
    const settings = makeSettings({ defaultOgImage: null });
    const result = generatePageMetadata(page, settings);
    expect(result.openGraph?.images).toBeUndefined();
  });

  it("returns no OG image for null media", () => {
    const page = makePage({ meta: { image: null } });
    const settings = makeSettings({ defaultOgImage: null });
    const result = generatePageMetadata(page, settings);
    expect(result.openGraph?.images).toBeUndefined();
  });

  it("returns resolved URL for populated Media object", () => {
    const page = makePage({
      meta: { image: makeMedia(1, "https://cdn.lumon.com/og.jpg") },
    });
    const result = generatePageMetadata(page, makeSettings());
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://cdn.lumon.com/og.jpg");
  });

  it("prepends baseUrl for relative media URLs", () => {
    const page = makePage({
      meta: { image: makeMedia(2, "/media/hero.png") },
    });
    const result = generatePageMetadata(
      page,
      makeSettings({ baseUrl: "https://lumon.com" })
    );
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://lumon.com/media/hero.png");
  });
});

// ── buildRobots ──────────────────────────────────────────────────────

describe("buildRobots (via generatePageMetadata)", () => {
  it("draft pages always get noindex/nofollow", () => {
    const page = makePage({ _status: "draft" });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.robots).toEqual({ index: false, follow: false });
  });

  it("per-page override: index=false, follow=true", () => {
    const page = makePage({
      meta: { robots: { override: true, index: false, follow: true } },
    });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.robots).toEqual({ index: false, follow: true });
  });

  it("per-page override: index=true, follow=false", () => {
    const page = makePage({
      meta: { robots: { override: true, index: true, follow: false } },
    });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.robots).toEqual({ index: true, follow: false });
  });

  it("no override: uses global defaults (index and follow both true)", () => {
    const page = makePage({ meta: { robots: { override: false } } });
    const result = generatePageMetadata(
      page,
      makeSettings({ robots: { index: true, follow: true } })
    );
    expect(result.robots).toEqual({ index: true, follow: true });
  });

  it("no override, global noindex: returns noindex", () => {
    const page = makePage({});
    const result = generatePageMetadata(
      page,
      makeSettings({ robots: { index: false, follow: true } })
    );
    expect(result.robots).toEqual({ index: false, follow: true });
  });
});

// ── generatePageMetadata ─────────────────────────────────────────────

describe("generatePageMetadata — title", () => {
  it("uses page meta title when present", () => {
    const page = makePage({ meta: { title: "Custom SEO Title" } });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.title).toBe("Custom SEO Title");
  });

  it("falls back to '{title}{separator}{siteName}' when no meta title", () => {
    const page = makePage({ title: "About Us", meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ siteName: "Lumon Industries", separator: " | " })
    );
    expect(result.title).toBe("About Us | Lumon Industries");
  });

  it("uses custom separator in fallback title", () => {
    const page = makePage({ title: "Contact", meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ siteName: "Acme Corp", separator: " — " })
    );
    expect(result.title).toBe("Contact — Acme Corp");
  });
});

describe("generatePageMetadata — canonical URL", () => {
  it("uses canonical URL from page meta.canonicalUrl", () => {
    const page = makePage({
      meta: { canonicalUrl: "https://lumon.com/custom-url" },
    });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.alternates?.canonical).toBe("https://lumon.com/custom-url");
  });

  it("falls back to baseUrl/slug when no canonicalUrl", () => {
    const page = makePage({ slug: "about", meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ baseUrl: "https://lumon.com" })
    );
    expect(result.alternates?.canonical).toBe("https://lumon.com/about");
  });

  it("home page canonical has no trailing slash", () => {
    const page = makePage({ slug: "home", meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ baseUrl: "https://lumon.com" })
    );
    // slug "home" → empty string → "https://lumon.com/" → strip trailing slash
    expect(result.alternates?.canonical).toBe("https://lumon.com");
  });
});

describe("generatePageMetadata — OG image", () => {
  it("uses OG image from page meta", () => {
    const ogMedia = makeMedia(1, "https://cdn.lumon.com/page-og.jpg");
    const page = makePage({ meta: { image: ogMedia } });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: null })
    );
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://cdn.lumon.com/page-og.jpg");
  });

  it("falls back to global defaultOgImage when no page meta image", () => {
    const defaultOg = makeMedia(2, "https://cdn.lumon.com/default-og.jpg");
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: defaultOg })
    );
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://cdn.lumon.com/default-og.jpg");
  });

  it("page meta image takes priority over default", () => {
    const pageOg = makeMedia(1, "https://cdn.lumon.com/page-og.jpg");
    const defaultOg = makeMedia(2, "https://cdn.lumon.com/default-og.jpg");
    const page = makePage({ meta: { image: pageOg } });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: defaultOg })
    );
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://cdn.lumon.com/page-og.jpg");
  });

  it("no OG image when neither page meta nor default exists", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: null })
    );
    expect(result.openGraph?.images).toBeUndefined();
  });

  it("includes width and height when provided", () => {
    const ogMedia = makeMedia(1, "https://cdn.lumon.com/og.jpg", {
      width: 1200,
      height: 630,
    });
    const page = makePage({ meta: { image: ogMedia } });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: null })
    );
    const images = result.openGraph?.images as Array<{
      url: string;
      width?: number;
      height?: number;
    }>;
    expect(images?.[0]?.width).toBe(1200);
    expect(images?.[0]?.height).toBe(630);
  });
});

describe("generatePageMetadata — keywords", () => {
  it("keywords passed through when present", () => {
    const page = makePage({ meta: { keywords: "lumon, mdr, innies" } });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.keywords).toBe("lumon, mdr, innies");
  });

  it("keywords omitted when absent", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.keywords).toBeUndefined();
  });
});

describe("generatePageMetadata — Twitter card", () => {
  it("uses twitter card type from global settings", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({
        social: { twitterCardType: "summary", twitter: "@lumon" },
      })
    );
    expect(result.twitter?.card).toBe("summary");
  });

  it("defaults to summary_large_image when not set", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(page, makeSettings({ social: {} }));
    expect(result.twitter?.card).toBe("summary_large_image");
  });

  it("includes twitter site handle when present", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({
        social: { twitterCardType: "summary_large_image", twitter: "@lumon" },
      })
    );
    expect(result.twitter?.site).toBe("@lumon");
  });

  it("omits twitter site when not present", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ social: { twitterCardType: "summary_large_image" } })
    );
    expect((result.twitter as any)?.site).toBeUndefined();
  });
});

describe("generatePageMetadata — edge cases", () => {
  it("omits canonical when baseUrl is empty/undefined", () => {
    const page = makePage({ slug: "about", meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ baseUrl: undefined })
    );
    expect(result.alternates).toBeUndefined();
  });

  it("title falls back to page title only when siteName is empty", () => {
    const page = makePage({ slug: "about", meta: {} });
    const result = generatePageMetadata(page, makeSettings({ siteName: "" }));
    // Should NOT produce "About Us | " with trailing separator
    expect(result.title).toBe("About Us");
  });

  it("title falls back to page title only when siteName is whitespace", () => {
    const page = makePage({ slug: "about", meta: {} });
    const result = generatePageMetadata(page, makeSettings({ siteName: "  " }));
    expect(result.title).toBe("About Us");
  });

  it("handles unpopulated media image (raw number ID)", () => {
    const page = makePage({ meta: { image: 42 } });
    const result = generatePageMetadata(
      page,
      makeSettings({ defaultOgImage: null })
    );
    // Should not produce an OG image entry for a raw number
    expect(result.openGraph?.images).toBeUndefined();
  });

  it("makes relative media URLs absolute", () => {
    const page = makePage({
      meta: { image: { id: 1, url: "/media/og.jpg", width: 800, height: 600 } },
    });
    const result = generatePageMetadata(
      page,
      makeSettings({ baseUrl: "https://lumon.com" })
    );
    const images = result.openGraph?.images as Array<{ url: string }>;
    expect(images?.[0]?.url).toBe("https://lumon.com/media/og.jpg");
  });
});

describe("generatePageMetadata — description", () => {
  it("uses page meta description when present", () => {
    const page = makePage({ meta: { description: "We do severance." } });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.description).toBe("We do severance.");
  });

  it("description is undefined when not set", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(page, makeSettings());
    expect(result.description).toBeUndefined();
  });
});

describe("generatePageMetadata — siteName in openGraph", () => {
  it("includes siteName in openGraph when present", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ siteName: "Lumon Industries" })
    );
    expect(result.openGraph?.siteName).toBe("Lumon Industries");
  });

  it("openGraph siteName is undefined when siteName not set", () => {
    const page = makePage({ meta: {} });
    const result = generatePageMetadata(
      page,
      makeSettings({ siteName: undefined })
    );
    expect(result.openGraph?.siteName).toBeUndefined();
  });
});
