"use client";

import Image from "next/image";
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
        <Link className="flex items-center gap-2" href="/">
          <Image
            alt="Lumon"
            className="dark:invert"
            height={28}
            priority
            src="/lumon-logo.svg"
            width={120}
          />
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
