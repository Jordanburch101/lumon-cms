export type SnapPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface AdminBarState {
  collapsed: boolean;
  position: SnapPosition;
}

export interface CollectionRoute {
  collection: string;
  label: string;
  prefix: string;
}

/**
 * Map URL prefixes to Payload collections.
 * Order matters — first match wins. The fallback to "pages" is built-in.
 * To add a new collection, add one entry:
 *   { prefix: "/blog", collection: "posts", label: "Edit Post" },
 */
export const COLLECTION_ROUTES: CollectionRoute[] = [
  // { prefix: "/blog", collection: "posts", label: "Edit Post" },
];

export interface PageContext {
  _status?: "draft" | "published";
  collection: string;
  createdAt?: string;
  id: number;
  label: string;
  slug: string;
  updatedAt?: string;
}

export interface AdminUser {
  email: string;
  id: number;
  name?: string;
}

const STORAGE_KEY = "lumon-admin-bar";
const LEADING_SLASH_RE = /^\//;
const TRAILING_SLASH_RE = /\/$/;

const DEFAULT_STATE: AdminBarState = {
  position: "bottom-center",
  collapsed: false,
};

export const SNAP_POSITIONS: Record<
  SnapPosition,
  { className: string; label: string }
> = {
  "top-left": { className: "top-4 left-4", label: "Top left" },
  "top-center": {
    className: "top-4 left-1/2 -translate-x-1/2",
    label: "Top center",
  },
  "top-right": { className: "top-4 right-4", label: "Top right" },
  "bottom-left": { className: "bottom-4 left-4", label: "Bottom left" },
  "bottom-center": {
    className: "bottom-4 left-1/2 -translate-x-1/2",
    label: "Bottom center",
  },
  "bottom-right": { className: "bottom-4 right-4", label: "Bottom right" },
};

export function loadBarState(): AdminBarState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<AdminBarState>;
    return {
      position:
        parsed.position && parsed.position in SNAP_POSITIONS
          ? parsed.position
          : DEFAULT_STATE.position,
      collapsed: parsed.collapsed ?? DEFAULT_STATE.collapsed,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveBarState(state: AdminBarState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function getSlugFromPathname(pathname: string): string {
  if (pathname === "/") {
    return "home";
  }
  return pathname.replace(LEADING_SLASH_RE, "").replace(TRAILING_SLASH_RE, "");
}

export function resolveCollection(pathname: string): {
  collection: string;
  label: string;
  slug: string;
} {
  for (const route of COLLECTION_ROUTES) {
    if (pathname === route.prefix || pathname.startsWith(`${route.prefix}/`)) {
      const slug = pathname
        .slice(route.prefix.length + 1)
        .replace(TRAILING_SLASH_RE, "");
      if (slug) {
        return {
          collection: route.collection,
          label: route.label,
          slug,
        };
      }
    }
  }
  return {
    collection: "pages",
    label: "Edit Page",
    slug: getSlugFromPathname(pathname),
  };
}

export type PageStatusState = "published" | "unpublished-changes" | "draft";

export interface PageStatus {
  collection: string;
  color: string;
  createdAt: string | null;
  label: string;
  lastEdited: string | null;
  lastPublished: string | null;
  pageId: number;
  state: PageStatusState;
  versionCount: number;
}

export interface PageStatusInput {
  _status: "published" | "draft";
  collection: string;
  createdAt: string | null;
  draftVersionCount: number;
  latestDraftUpdatedAt: string | null;
  pageId: number;
  totalVersionCount: number;
  updatedAt: string;
}

const STATUS_COLORS: Record<PageStatusState, string> = {
  published: "#22c55e",
  "unpublished-changes": "#f59e0b",
  draft: "#9ca3af",
};

const STATUS_LABELS: Record<PageStatusState, string> = {
  published: "Published",
  "unpublished-changes": "Unpublished changes",
  draft: "Draft",
};

export function computePageStatus(input: PageStatusInput): PageStatus {
  const shared = {
    collection: input.collection,
    createdAt: input.createdAt,
    pageId: input.pageId,
    versionCount: input.totalVersionCount,
  };

  if (input._status === "draft") {
    return {
      ...shared,
      state: "draft" as const,
      color: STATUS_COLORS.draft,
      label: STATUS_LABELS.draft,
      lastPublished: null,
      lastEdited: input.updatedAt,
    };
  }

  const hasNewerDrafts =
    input.draftVersionCount > 0 &&
    input.latestDraftUpdatedAt !== null &&
    new Date(input.latestDraftUpdatedAt) > new Date(input.updatedAt);

  if (hasNewerDrafts) {
    return {
      ...shared,
      state: "unpublished-changes" as const,
      color: STATUS_COLORS["unpublished-changes"],
      label: STATUS_LABELS["unpublished-changes"],
      lastPublished: input.updatedAt,
      lastEdited: input.latestDraftUpdatedAt,
    };
  }

  return {
    ...shared,
    state: "published" as const,
    color: STATUS_COLORS.published,
    label: STATUS_LABELS.published,
    lastPublished: input.updatedAt,
    lastEdited: null,
  };
}

export function formatRelativeTime(
  dateString: string,
  now: Date = new Date()
): string {
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  }
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }
  return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
}
