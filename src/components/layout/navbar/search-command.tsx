"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { searchGroups } from "./search-data";

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
      <SearchCommandDialog />
    </SearchCommandContext.Provider>
  );
}

function SearchCommandDialog() {
  const { open, setOpen } = useSearchCommand();
  const router = useRouter();

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router, setOpen]
  );

  return (
    <CommandDialog
      description="Search pages, products, and articles"
      onOpenChange={setOpen}
      open={open}
      title="Search"
    >
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && <CommandSeparator />}
              <CommandGroup heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    keywords={item.keywords}
                    onSelect={() => handleSelect(item.href)}
                    value={item.title}
                  >
                    {item.icon && (
                      <HugeiconsIcon
                        className="size-3.5 text-muted-foreground"
                        icon={item.icon}
                        strokeWidth={2}
                      />
                    )}
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.subtitle && (
                        <span className="text-[0.625rem] text-muted-foreground leading-snug">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
