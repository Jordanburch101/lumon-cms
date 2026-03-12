import type { PageContext } from "./admin-bar-data";

// --- Types ---

export interface CollectionMeta {
  hasVersions: boolean;
  isUpload: boolean;
  label: string;
  slug: string;
  titleField: string;
}

export interface MergedCollectionMeta extends CollectionMeta {
  priority?: number;
  showThumbnail?: boolean;
  subtitleField?: string;
}

export interface StaticCommand {
  action:
    | { type: "navigate"; url: string }
    | { type: "inline"; command: string };
  badge: "action" | "navigate";
  id: string;
  label: string;
}

interface PaletteOverride {
  hidden?: boolean;
  priority?: number;
  showThumbnail?: boolean;
  subtitleField?: string;
}

// --- Overrides Config ---

export const PALETTE_OVERRIDES: Record<string, PaletteOverride> = {
  pages: { priority: 1, subtitleField: "slug" },
  media: { priority: 2, showThumbnail: true },
  users: { hidden: true },
};

// --- Static Commands ---

const BASE_COMMANDS: StaticCommand[] = [
  {
    id: "create-page",
    label: "Create new page",
    action: { type: "navigate", url: "/admin/collections/pages/create" },
    badge: "action",
  },
  {
    id: "go-collections",
    label: "Go to Collections",
    action: { type: "navigate", url: "/admin/collections" },
    badge: "navigate",
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

export function getStaticCommands(
  pageContext: PageContext | null
): StaticCommand[] {
  const commands = [...BASE_COMMANDS];

  if (pageContext) {
    commands.push({
      id: "edit-current",
      label: "Edit current page",
      action: {
        type: "navigate",
        url: `/admin/collections/${pageContext.collection}/${pageContext.id}`,
      },
      badge: "navigate",
    });
    commands.push({
      id: "view-versions",
      label: "View page versions",
      action: {
        type: "navigate",
        url: `/admin/collections/${pageContext.collection}/${pageContext.id}/versions`,
      },
      badge: "navigate",
    });
  }

  return commands;
}

export function filterCommands(
  commands: StaticCommand[],
  query: string
): StaticCommand[] {
  if (!query) {
    return commands;
  }
  const lower = query.toLowerCase();
  return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
}

// --- Search URL Builder ---

export function buildSearchUrl(
  meta: CollectionMeta,
  query: string,
  subtitleField?: string
): string {
  const encoded = encodeURIComponent(query);
  let url = `/api/${meta.slug}?where[${meta.titleField}][contains]=${encoded}&limit=5&select[id]=true&select[${meta.titleField}]=true`;

  if (meta.hasVersions) {
    url += "&select[_status]=true";
  }

  if (meta.isUpload) {
    url +=
      "&select[filename]=true&select[mimeType]=true&select[sizes.thumbnail.url]=true";
  }

  if (subtitleField) {
    url += `&select[${subtitleField}]=true`;
  }

  return url;
}

// --- Collection Metadata ---

export function mergeCollectionMeta(
  raw: CollectionMeta[]
): MergedCollectionMeta[] {
  return raw
    .map((meta) => {
      const override = PALETTE_OVERRIDES[meta.slug];
      if (override?.hidden) {
        return null;
      }
      return {
        ...meta,
        priority: override?.priority,
        showThumbnail: override?.showThumbnail,
        subtitleField: override?.subtitleField,
      } satisfies MergedCollectionMeta;
    })
    .filter((m): m is MergedCollectionMeta => m !== null)
    .sort((a, b) => {
      const ap = a.priority ?? Number.POSITIVE_INFINITY;
      const bp = b.priority ?? Number.POSITIVE_INFINITY;
      if (ap !== bp) {
        return ap - bp;
      }
      return a.label.localeCompare(b.label);
    });
}

// --- Metadata Fetcher (cached) ---

let cachedMeta: MergedCollectionMeta[] | null = null;

export async function fetchCollectionMeta(
  signal?: AbortSignal
): Promise<MergedCollectionMeta[]> {
  if (cachedMeta) {
    return cachedMeta;
  }

  const res = await fetch("/api/admin/collections", {
    credentials: "include",
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch collection metadata: ${res.status}`);
  }

  const raw: CollectionMeta[] = await res.json();
  cachedMeta = mergeCollectionMeta(raw);
  return cachedMeta;
}
