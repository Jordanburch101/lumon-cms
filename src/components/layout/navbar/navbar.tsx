"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScrolled } from "@/core/hooks/use-scrolled";
import { cn } from "@/core/lib/utils";
import { NavbarDesktop } from "./navbar-desktop";
import { NavbarMobile } from "./navbar-mobile";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-lg"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        <Link className="flex items-center" href="/">
          <span className="font-semibold text-base tracking-tight">
            Lumon<span className="text-muted-foreground">Payload</span>
          </span>
        </Link>

        <NavbarDesktop />

        <div className="hidden items-center gap-1 md:flex">
          <SearchTrigger />
          <ThemeToggle />
          <Button className="ml-2" size="default">
            Get Started
          </Button>
        </div>

        <NavbarMobile />
      </div>
    </header>
  );
}
