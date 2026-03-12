import { describe, expect, it } from "bun:test";
import { computePageStatus, formatRelativeTime } from "./admin-bar-data";

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
});

describe("formatRelativeTime", () => {
  it("returns 'just now' for times less than 60 seconds ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T11:59:30Z", now)).toBe("just now");
  });

  it("returns minutes for times less than 60 minutes ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T11:45:00Z", now)).toBe("15 min ago");
  });

  it("returns hours for times less than 24 hours ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T09:00:00Z", now)).toBe("3 hours ago");
  });

  it("returns '1 hour ago' (singular)", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-12T10:30:00Z", now)).toBe("1 hour ago");
  });

  it("returns days for times less than 30 days ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-09T12:00:00Z", now)).toBe("3 days ago");
  });

  it("returns '1 day ago' (singular)", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-03-11T12:00:00Z", now)).toBe("1 day ago");
  });

  it("returns months for times more than 30 days ago", () => {
    const now = new Date("2026-03-12T12:00:00Z");
    expect(formatRelativeTime("2026-01-05T12:00:00Z", now)).toBe(
      "2 months ago"
    );
  });
});
