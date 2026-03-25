"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CMSLink } from "@/components/ui/cms-link";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Header } from "@/payload-types";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

type NavItems = NonNullable<Header["navItems"]>;
type CtaData = Header["cta"];

export function NavbarMobile({
  navItems,
  cta,
}: {
  navItems: NavItems;
  cta: CtaData;
}) {
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
                if (item.blockType === "direct-link") {
                  return (
                    <CMSLink
                      className="flex h-10 items-center border-b px-2 font-medium text-xs"
                      key={item.id ?? item.link.label}
                      link={item.link}
                    />
                  );
                }

                const label = item.label;

                const links =
                  item.blockType === "mega-menu"
                    ? (item.groups ?? []).flatMap((g) => g.items ?? [])
                    : (item.items ?? []);

                return (
                  <AccordionItem key={item.id ?? label} value={label}>
                    <AccordionTrigger>{label}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1">
                        {links.map((link) => (
                          <CMSLink
                            className="rounded-md px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
                            key={link.id ?? link.link.label}
                            link={link.link}
                          />
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
            {cta?.show !== false && (
              <CMSLink className="w-full" link={cta?.link} />
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
