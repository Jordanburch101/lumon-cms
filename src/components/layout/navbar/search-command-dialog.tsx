"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
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
import { useSearchCommand } from "./search-command";
import { searchGroups } from "./search-data";

export default function SearchCommandDialogImpl() {
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
