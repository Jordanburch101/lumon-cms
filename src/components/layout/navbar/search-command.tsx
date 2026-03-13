"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SearchCommandContext {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SearchCommandContext = createContext<SearchCommandContext>({
  open: false,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: noop default
  setOpen: () => {},
});

export function useSearchCommand() {
  return useContext(SearchCommandContext);
}

export function SearchCommandProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <SearchCommandContext.Provider value={value}>
      {children}
      {mounted && <SearchCommandDialogLazy />}
    </SearchCommandContext.Provider>
  );
}

/** Lazy-loaded to avoid useRouter() during prerender */
function SearchCommandDialogLazy() {
  const [Dialog, setDialog] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("./search-command-dialog").then((mod) =>
      setDialog(() => mod.default)
    );
  }, []);

  if (!Dialog) {
    return null;
  }
  return <Dialog />;
}
