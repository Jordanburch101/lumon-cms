import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  buildSearchUrl,
  clearCollectionMetaCache,
  type CollectionMeta,
  fetchCollectionMeta,
  filterCommands,
  getStaticCommands,
  mergeCollectionMeta,
  type StaticCommand,
} from "./admin-command-data";

describe("filterCommands", () => {
  const commands: StaticCommand[] = [
    {
      id: "create-page",
      label: "Create new page",
      action: { type: "navigate", url: "/admin/collections/pages/create" },
      badge: "action",
    },
    {
      id: "go-dashboard",
      label: "Go to Dashboard",
      action: { type: "navigate", url: "/admin" },
      badge: "navigate",
    },
    {
      id: "toggle-draft",
      label: "Toggle draft mode",
      action: { type: "inline", command: "toggle-draft" },
      badge: "action",
    },
  ];

  test("returns all commands when query is empty", () => {
    expect(filterCommands(commands, "")).toEqual(commands);
  });

  test("filters by case-insensitive substring match", () => {
    const result = filterCommands(commands, "dash");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("go-dashboard");
  });

  test("matches partial words", () => {
    const result = filterCommands(commands, "draft");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("toggle-draft");
  });

  test("returns empty array when nothing matches", () => {
    expect(filterCommands(commands, "xyznonexistent")).toEqual([]);
  });

  test("matches multiple commands", () => {
    const result = filterCommands(commands, "to");
    expect(result).toHaveLength(2);
  });
});

describe("getStaticCommands", () => {
  test("returns non-context commands when no page context", () => {
    const commands = getStaticCommands(null);
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("create-page");
    expect(ids).toContain("go-collections");
    expect(ids).toContain("go-dashboard");
    expect(ids).toContain("toggle-draft");
    expect(ids).not.toContain("edit-current");
    expect(ids).not.toContain("view-versions");
  });

  test("includes context-aware commands when page context is set", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const ids = commands.map((c) => c.id);
    expect(ids).toContain("edit-current");
    expect(ids).toContain("view-versions");
  });

  test("edit-current command URL includes collection and id", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const editCmd = commands.find((c) => c.id === "edit-current");
    expect(editCmd?.action).toEqual({
      type: "navigate",
      url: "/admin/collections/pages/42",
    });
  });

  test("view-versions command URL includes collection and id", () => {
    const commands = getStaticCommands({
      id: 42,
      slug: "about",
      collection: "pages",
      label: "About",
      _status: "published",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    const versionsCmd = commands.find((c) => c.id === "view-versions");
    expect(versionsCmd?.action).toEqual({
      type: "navigate",
      url: "/admin/collections/pages/42/versions",
    });
  });
});

describe("buildSearchUrl", () => {
  const baseMeta: CollectionMeta = {
    slug: "pages",
    label: "Pages",
    titleField: "title",
    hasVersions: false,
    isUpload: false,
  };

  test("builds basic search URL with contains operator", () => {
    const url = buildSearchUrl(baseMeta, "hello");
    expect(url).toBe(
      "/api/pages?where[title][contains]=hello&limit=5&select[id]=true&select[title]=true"
    );
  });

  test("adds _status select for versioned collections", () => {
    const meta = { ...baseMeta, hasVersions: true };
    const url = buildSearchUrl(meta, "hello");
    expect(url).toContain("&select[_status]=true");
  });

  test("adds upload fields for upload collections", () => {
    const meta: CollectionMeta = {
      slug: "media",
      label: "Media",
      titleField: "filename",
      hasVersions: false,
      isUpload: true,
    };
    const url = buildSearchUrl(meta, "hero");
    expect(url).toContain("&select[filename]=true");
    expect(url).toContain("&select[mimeType]=true");
    expect(url).toContain("&select[sizes]=true");
  });

  test("adds subtitle field when override specifies one", () => {
    const url = buildSearchUrl(baseMeta, "hello", "slug");
    expect(url).toContain("&select[slug]=true");
  });

  test("encodes query parameter", () => {
    const url = buildSearchUrl(baseMeta, "hello world");
    expect(url).toContain("contains]=hello%20world");
  });
});

describe("mergeCollectionMeta", () => {
  const rawMeta: CollectionMeta[] = [
    {
      slug: "pages",
      label: "Pages",
      titleField: "title",
      hasVersions: true,
      isUpload: false,
    },
    {
      slug: "media",
      label: "Media",
      titleField: "filename",
      hasVersions: false,
      isUpload: true,
    },
    {
      slug: "users",
      label: "Users",
      titleField: "email",
      hasVersions: false,
      isUpload: false,
    },
  ];

  test("filters out hidden collections", () => {
    const result = mergeCollectionMeta(rawMeta);
    const slugs = result.map((c) => c.slug);
    expect(slugs).not.toContain("users");
  });

  test("sorts by priority ascending, then alphabetically", () => {
    const extended: CollectionMeta[] = [
      ...rawMeta,
      {
        slug: "articles",
        label: "Articles",
        titleField: "title",
        hasVersions: true,
        isUpload: false,
      },
    ];
    const result = mergeCollectionMeta(extended);
    const slugs = result.map((c) => c.slug);
    expect(slugs).toEqual(["pages", "media", "articles"]);
  });

  test("applies showThumbnail override", () => {
    const result = mergeCollectionMeta(rawMeta);
    const media = result.find((c) => c.slug === "media");
    expect(media?.showThumbnail).toBe(true);
  });

  test("collections without priority sort alphabetically after prioritized ones", () => {
    const custom: CollectionMeta[] = [
      {
        slug: "zebras",
        label: "Zebras",
        titleField: "name",
        hasVersions: false,
        isUpload: false,
      },
      {
        slug: "alpacas",
        label: "Alpacas",
        titleField: "name",
        hasVersions: false,
        isUpload: false,
      },
      {
        slug: "pages",
        label: "Pages",
        titleField: "title",
        hasVersions: true,
        isUpload: false,
      },
    ];
    const result = mergeCollectionMeta(custom);
    const slugs = result.map((c) => c.slug);
    expect(slugs).toEqual(["pages", "alpacas", "zebras"]);
  });
});

describe("fetchCollectionMeta", () => {
  const mockCollections: CollectionMeta[] = [
    {
      slug: "pages",
      label: "Pages",
      titleField: "title",
      hasVersions: true,
      isUpload: false,
    },
    {
      slug: "media",
      label: "Media",
      titleField: "filename",
      hasVersions: false,
      isUpload: true,
    },
  ];

  afterEach(() => {
    clearCollectionMetaCache();
    mock.restore();
  });

  test("fetches from /api/admin/collections and returns merged meta", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockCollections)))
    );

    const result = await fetchCollectionMeta();
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("pages");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test("returns cached result on subsequent calls", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockCollections)))
    );

    await fetchCollectionMeta();
    const result = await fetchCollectionMeta();
    expect(result).toHaveLength(2);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test("clearCollectionMetaCache forces re-fetch", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockCollections)))
    );

    await fetchCollectionMeta();
    clearCollectionMetaCache();
    await fetchCollectionMeta();
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  test("throws on non-ok response", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 401 }))
    );

    expect(fetchCollectionMeta()).rejects.toThrow(
      "Failed to fetch collection metadata: 401"
    );
  });

  test("passes signal to fetch", async () => {
    const controller = new AbortController();
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockCollections)))
    );

    await fetchCollectionMeta(controller.signal);
    const callArgs = (globalThis.fetch as ReturnType<typeof mock>).mock
      .calls[0] as [string, RequestInit];
    expect(callArgs[1].signal).toBe(controller.signal);
  });

  test("sends credentials include", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockCollections)))
    );

    await fetchCollectionMeta();
    const callArgs = (globalThis.fetch as ReturnType<typeof mock>).mock
      .calls[0] as [string, RequestInit];
    expect(callArgs[1].credentials).toBe("include");
  });
});
