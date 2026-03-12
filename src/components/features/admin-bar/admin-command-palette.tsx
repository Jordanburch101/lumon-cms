"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import type { PageContext } from "./admin-bar-data";
import {
  buildSearchUrl,
  fetchCollectionMeta,
  filterCommands,
  getStaticCommands,
  type MergedCollectionMeta,
  type StaticCommand,
} from "./admin-command-data";
import {
  CollectionResultGroup,
  CommandResultGroup,
} from "./admin-command-results";

// --- Types ---

interface AdminCommandPaletteProps {
  handleToggleDraft: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  pageContext: PageContext | null;
}

interface SearchResults {
  docs: Array<{ id: string | number; [key: string]: unknown }>;
  meta: MergedCollectionMeta;
}

// --- Component ---

export function AdminCommandPalette({
  handleToggleDraft,
  onOpenChange,
  open,
  pageContext,
}: AdminCommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<MergedCollectionMeta[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keyboard shortcut: Cmd+Shift+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange]);

  // Fetch collection metadata on first open
  useEffect(() => {
    if (!open) {
      return;
    }
    if (collections.length > 0) {
      return;
    }

    const controller = new AbortController();
    fetchCollectionMeta(controller.signal)
      .then(setCollections)
      .catch(() => {
        // Silently fail — palette will show commands only
      });
    return () => controller.abort();
  }, [open, collections.length]);

  // Reset state and cancel pending work when palette closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
    }
  }, [open]);

  // Debounced search
  const search = useCallback(
    (q: string) => {
      // Cancel previous
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }

      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      debounceRef.current = setTimeout(() => {
        const controller = new AbortController();
        abortRef.current = controller;

        const searchable = collections.filter((c) => c.titleField !== "id");

        const fetches = searchable.map(async (meta) => {
          try {
            const url = buildSearchUrl(meta, q, meta.subtitleField);
            const res = await fetch(url, {
              credentials: "include",
              signal: controller.signal,
            });

            if (res.status === 401) {
              // Session expired — close palette
              controller.abort();
              onOpenChange(false);
              return null;
            }

            if (!res.ok) {
              return null;
            }

            const data = await res.json();
            return { meta, docs: data.docs ?? [] } satisfies SearchResults;
          } catch {
            return null;
          }
        });

        Promise.all(fetches).then((fetched) => {
          if (controller.signal.aborted) {
            return;
          }
          setResults(
            fetched.filter(
              (r): r is SearchResults => r !== null && r.docs.length > 0
            )
          );
          setLoading(false);
        });
      }, 100);
    },
    [collections, onOpenChange]
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    search(value);
  }

  // --- Actions ---

  function handleCollectionSelect(slug: string, docId: string | number) {
    window.open(`/admin/collections/${slug}/${docId}`, "_blank");
    onOpenChange(false);
  }

  function handleCommandSelect(cmd: StaticCommand) {
    if (cmd.action.type === "navigate") {
      window.open(cmd.action.url, "_blank");
    } else if (cmd.action.command === "toggle-draft") {
      handleToggleDraft();
    }
    onOpenChange(false);
  }

  // --- Render ---

  const staticCommands = getStaticCommands(pageContext);
  const filteredCommands = filterCommands(staticCommands, query);
  const hasResults = results.length > 0 || filteredCommands.length > 0;
  const showLoading = loading && query.trim().length > 0;

  return (
    <CommandDialog
      description="Search across collections or type a command"
      onOpenChange={onOpenChange}
      open={open}
      title="Admin Command Palette"
    >
      <Command shouldFilter={false}>
        <CommandInput
          onValueChange={handleQueryChange}
          placeholder="Search pages, media, or type a command..."
          value={query}
        />
        <CommandList>
          {showLoading && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          )}

          {!(showLoading || hasResults) && query.trim() && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          {!showLoading && (
            <>
              {results.map((group, i) => (
                <CollectionResultGroup
                  docs={group.docs}
                  isFirst={i === 0}
                  key={group.meta.slug}
                  meta={group.meta}
                  onSelect={handleCollectionSelect}
                />
              ))}

              <CommandResultGroup
                commands={filteredCommands}
                isFirst={results.length === 0}
                onSelect={handleCommandSelect}
              />
            </>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t px-3 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </Command>
    </CommandDialog>
  );
}
