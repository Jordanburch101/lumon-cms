import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function SearchTrigger() {
  return (
    <Button aria-label="Search" size="icon" variant="ghost">
      <HugeiconsIcon className="size-4" icon={SearchIcon} strokeWidth={2} />
    </Button>
  );
}
