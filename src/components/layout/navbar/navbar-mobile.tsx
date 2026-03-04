"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { navItems } from "./navbar-data";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

export function NavbarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        size="icon"
        variant="ghost"
      >
        <HugeiconsIcon className="size-5" icon={Menu01Icon} strokeWidth={2} />
      </Button>

      <Sheet onOpenChange={setOpen} open={open}>
        <SheetContent className="w-80 overflow-y-auto" side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 py-4">
            <Accordion className="border-none" type="multiple">
              {navItems.map((item) => {
                if (item.href && !item.groups && !item.items) {
                  return (
                    <Link
                      className="flex h-10 items-center border-b px-2 font-medium text-xs"
                      href={item.href}
                      key={item.title}
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                  );
                }

                const links = item.groups
                  ? item.groups.flatMap((g) => g.items)
                  : (item.items ?? []);

                return (
                  <AccordionItem key={item.title} value={item.title}>
                    <AccordionTrigger>{item.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1">
                        {links.map((link) => (
                          <Link
                            className="rounded-md px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                            href={link.href}
                            key={link.href}
                            onClick={() => setOpen(false)}
                          >
                            {link.title}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>

          <SheetFooter className="border-t">
            <div className="flex items-center gap-2">
              <SearchTrigger />
              <ThemeToggle />
            </div>
            <Button className="w-full" size="lg">
              Get Started
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
