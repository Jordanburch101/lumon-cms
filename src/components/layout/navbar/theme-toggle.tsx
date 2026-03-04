"use client";

import { MoonIcon, SunIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      <HugeiconsIcon
        className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
        icon={SunIcon}
        strokeWidth={2}
      />
      <HugeiconsIcon
        className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
        icon={MoonIcon}
        strokeWidth={2}
      />
    </Button>
  );
}
