import { describe, expect, it } from "bun:test";
import {
  computePageStatus,
  findNearestSnap,
  formatRelativeTime,
  getSlugFromPathname,
  resolveCollection,
} from "./admin-bar-data";

// ── getSlugFromPathname ─────────────────────────────────────────────

describe("getSlugFromPathname", () => {
  it("returns 'home' for root path", () => {
    expect(getSlugFromPathname("/")).toBe("home");
  });

  it("strips leading slash", () => {
    expect(getSlugFromPathname("/about")).toBe("about");
  });

  it("strips trailing slash", () => {
    expect(getSlugFromPathname("/about/")).toBe("about");
  });

  it("strips both leading and trailing slashes", () => {
    expect(getSlugFromPathname("/about/")).toBe("about");
  });

  it("handles nested paths", () => {
    expect(getSlugFromPathname("/blog/my-post")).toBe("blog/my-post");
  });

  it("handles deeply nested paths with trailing slash", () => {
    expect(getSlugFromPathname("/a/b/c/")).toBe("a/b/c");
  });
});

// ── resolveCollection ───────────────────────────────────────────────

describe("resolveCollection", () => {
  it("falls back to 'pages' collection for root path", () => {
    const result = resolveCollection("/");
    expect(result).toEqual({
      collection: "pages",
      label: "Edit Page",
      path: "home",
    });
  });

  it("falls back to 'pages' collection for unknown paths", () => {
    const result = resolveCollection("/about");
    expect(result).toEqual({
      collection: "pages",
      label: "Edit Page",
      path: "about",
    });
  });

  it("handles nested paths as pages", () => {
    const result = resolveCollection("/services/consulting");
    expect(result).toEqual({
      collection: "pages",
      label: "Edit Page",
      path: "services/consulting",
    });
  });

  it("strips trailing slashes in fallback", () => {
    const result = resolveCollection("/about/");
    expect(result).toEqual({
      collection: "pages",
      label: "Edit Page",
      path: "about",
    });
  });
});

// ── findNearestSnap ─────────────────────────────────────────────────

describe("findNearestSnap", () => {
  const W = 1920;
  const H = 1080;

  it("snaps to top-left when near top-left corner", () => {
    expect(findNearestSnap(20, 20, W, H)).toBe("top-left");
  });

  it("snaps to top-center when near top center", () => {
    expect(findNearestSnap(W / 2, 20, W, H)).toBe("top-center");
  });

  it("snaps to top-right when near top-right corner", () => {
    expect(findNearestSnap(W - 20, 20, W, H)).toBe("top-right");
  });

  it("snaps to bottom-left when near bottom-left corner", () => {
    expect(findNearestSnap(20, H - 20, W, H)).toBe("bottom-left");
  });

  it("snaps to bottom-center when near bottom center", () => {
    expect(findNearestSnap(W / 2, H - 20, W, H)).toBe("bottom-center");
  });

  it("snaps to bottom-right when near bottom-right corner", () => {
    expect(findNearestSnap(W - 20, H - 20, W, H)).toBe("bottom-right");
  });

  it("snaps to nearest zone when in ambiguous position", () => {
    // Slightly closer to top-left than top-center
    const result = findNearestSnap(100, 16, W, H);
    expect(result).toBe("top-left");
  });

  it("snaps to center of screen to nearest center zone", () => {
    // Dead center of viewport — closest to bottom-center or top-center
    const result = findNearestSnap(W / 2, H / 2, W, H);
    // Both top-center and bottom-center are equidistant, first match wins
    expect(["top-center", "bottom-center"]).toContain(result);
  });

  it("handles small viewport", () => {
    expect(findNearestSnap(160, 400, 320, 568)).toBe("bottom-center");
  });

  it("handles exact zone coordinates", () => {
    expect(findNearestSnap(16, 16, W, H)).toBe("top-left");
    expect(findNearestSnap(W - 16, H - 16, W, H)).toBe("bottom-right");
  });
});

// ── computePageStatus ───────────────────────────────────────────────

const SHARED_INPUT = {
  collection: "pages",
  createdAt: "2026-03-01T00:00:00Z",
  pageId: 1,
};

const SHARED_OUTPUT = {
  collection: "pages",
  createdAt: "2026-03-01T00:00:00Z",
  pageId: 1,
};

describe("computePageStatus", () => {
  it("returns 'published' when page is published with no draft versions", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 5,
    });
    expect(result).toEqual({
      ...SHARED_OUTPUT,
      state: "published",
      color: "#22c55e",
      label: "Published",
      lastPublished: "2026-03-10T12:00:00Z",
      lastEdited: null,
      versionCount: 5,
    });
  });

  it("returns 'unpublished-changes' when published page has newer drafts", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 2,
      latestDraftUpdatedAt: "2026-03-11T08:00:00Z",
      totalVersionCount: 7,
    });
    expect(result).toEqual({
      ...SHARED_OUTPUT,
      state: "unpublished-changes",
      color: "#f59e0b",
      label: "Unpublished changes",
      lastPublished: "2026-03-10T12:00:00Z",
      lastEdited: "2026-03-11T08:00:00Z",
      versionCount: 7,
    });
  });

  it("returns 'draft' when page status is draft", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "draft",
      updatedAt: "2026-03-09T15:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 1,
    });
    expect(result).toEqual({
      ...SHARED_OUTPUT,
      state: "draft",
      color: "#9ca3af",
      label: "Draft",
      lastPublished: null,
      lastEdited: "2026-03-09T15:00:00Z",
      versionCount: 1,
    });
  });

  it("returns 'published' when draft versions exist but are older", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-11T12:00:00Z",
      draftVersionCount: 1,
      latestDraftUpdatedAt: "2026-03-10T08:00:00Z",
      totalVersionCount: 4,
    });
    expect(result).toEqual({
      ...SHARED_OUTPUT,
      state: "published",
      color: "#22c55e",
      label: "Published",
      lastPublished: "2026-03-11T12:00:00Z",
      lastEdited: null,
      versionCount: 4,
    });
  });

  it("returns 'published' when draft count > 0 but latestDraftUpdatedAt is null", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 3,
      latestDraftUpdatedAt: null,
      totalVersionCount: 6,
    });
    expect(result.state).toBe("published");
  });

  it("returns 'unpublished-changes' at exact same millisecond boundary", () => {
    // Same timestamp — NOT newer, so should be "published"
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 1,
      latestDraftUpdatedAt: "2026-03-10T12:00:00Z",
      totalVersionCount: 3,
    });
    expect(result.state).toBe("published");
  });

  it("passes through collection, createdAt, and pageId", () => {
    const result = computePageStatus({
      _status: "draft",
      collection: "posts",
      createdAt: "2025-01-01T00:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      pageId: 42,
      totalVersionCount: 1,
      updatedAt: "2025-01-02T00:00:00Z",
    });
    expect(result.collection).toBe("posts");
    expect(result.createdAt).toBe("2025-01-01T00:00:00Z");
    expect(result.pageId).toBe(42);
  });

  it("handles null createdAt", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "draft",
      createdAt: null,
      updatedAt: "2026-03-09T15:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 1,
    });
    expect(result.createdAt).toBeNull();
  });

  it("maps totalVersionCount to versionCount", () => {
    const result = computePageStatus({
      ...SHARED_INPUT,
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 99,
    });
    expect(result.versionCount).toBe(99);
  });
});

// ── formatRelativeTime ──────────────────────────────────────────────

describe("formatRelativeTime", () => {
  const now = new Date("2026-03-12T12:00:00Z");

  it("returns 'just now' for times less than 60 seconds ago", () => {
    expect(formatRelativeTime("2026-03-12T11:59:30Z", now)).toBe("just now");
  });

  it("returns 'just now' for 0 seconds ago", () => {
    expect(formatRelativeTime("2026-03-12T12:00:00Z", now)).toBe("just now");
  });

  it("returns minutes for times less than 60 minutes ago", () => {
    expect(formatRelativeTime("2026-03-12T11:45:00Z", now)).toBe("15 min ago");
  });

  it("returns '1 min ago' at exactly 60 seconds", () => {
    expect(formatRelativeTime("2026-03-12T11:59:00Z", now)).toBe("1 min ago");
  });

  it("returns hours for times less than 24 hours ago", () => {
    expect(formatRelativeTime("2026-03-12T09:00:00Z", now)).toBe("3 hours ago");
  });

  it("returns '1 hour ago' (singular)", () => {
    expect(formatRelativeTime("2026-03-12T10:30:00Z", now)).toBe("1 hour ago");
  });

  it("returns days for times less than 30 days ago", () => {
    expect(formatRelativeTime("2026-03-09T12:00:00Z", now)).toBe("3 days ago");
  });

  it("returns '1 day ago' (singular)", () => {
    expect(formatRelativeTime("2026-03-11T12:00:00Z", now)).toBe("1 day ago");
  });

  it("returns months for times more than 30 days ago", () => {
    expect(formatRelativeTime("2026-01-05T12:00:00Z", now)).toBe(
      "2 months ago"
    );
  });

  it("returns '1 month ago' (singular)", () => {
    expect(formatRelativeTime("2026-02-05T12:00:00Z", now)).toBe("1 month ago");
  });

  it("returns '59 min ago' at the boundary", () => {
    expect(formatRelativeTime("2026-03-12T11:01:00Z", now)).toBe("59 min ago");
  });

  it("returns '23 hours ago' at the boundary", () => {
    expect(formatRelativeTime("2026-03-11T13:00:00Z", now)).toBe(
      "23 hours ago"
    );
  });

  it("returns '29 days ago' at the boundary", () => {
    expect(formatRelativeTime("2026-02-11T12:00:00Z", now)).toBe("29 days ago");
  });
});
