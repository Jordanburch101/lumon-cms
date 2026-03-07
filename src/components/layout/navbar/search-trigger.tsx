"use client";

import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { useSearchCommand } from "./search-command";

export function SearchTrigger() {
  const { setOpen } = useSearchCommand();

  return (
    <Button
      aria-label="Search"
      onClick={() => setOpen(true)}
      size="icon"
      variant="ghost"
    >
      <HugeiconsIcon className="size-4" icon={SearchIcon} strokeWidth={2} />
    </Button>
  );
}
