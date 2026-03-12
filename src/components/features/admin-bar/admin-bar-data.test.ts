import { describe, expect, it } from "bun:test";
import { computePageStatus } from "./admin-bar-data";

describe("computePageStatus", () => {
  it("returns 'published' when page is published with no draft versions", () => {
    const result = computePageStatus({
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 5,
    });
    expect(result).toEqual({
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
      _status: "published",
      updatedAt: "2026-03-10T12:00:00Z",
      draftVersionCount: 2,
      latestDraftUpdatedAt: "2026-03-11T08:00:00Z",
      totalVersionCount: 7,
    });
    expect(result).toEqual({
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
      _status: "draft",
      updatedAt: "2026-03-09T15:00:00Z",
      draftVersionCount: 0,
      latestDraftUpdatedAt: null,
      totalVersionCount: 1,
    });
    expect(result).toEqual({
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
      _status: "published",
      updatedAt: "2026-03-11T12:00:00Z",
      draftVersionCount: 1,
      latestDraftUpdatedAt: "2026-03-10T08:00:00Z",
      totalVersionCount: 4,
    });
    expect(result).toEqual({
      state: "published",
      color: "#22c55e",
      label: "Published",
      lastPublished: "2026-03-11T12:00:00Z",
      lastEdited: null,
      versionCount: 4,
    });
  });
});
