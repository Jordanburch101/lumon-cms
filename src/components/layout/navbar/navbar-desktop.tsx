import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/core/lib/utils";
import type { NavGroup, NavItem } from "./navbar-data";
import { navItems } from "./navbar-data";

function MegaMenuContent({ item }: { item: NavItem }) {
  if (!item.groups) {
    return null;
  }
  return (
    <div className="grid gap-2 p-2 md:w-[460px] lg:w-[540px] lg:grid-cols-2">
      {item.groups.map((group: NavGroup) => (
        <div className="space-y-0.5" key={group.title}>
          <h4 className="px-1.5 pb-0.5 font-medium text-[0.625rem] text-muted-foreground uppercase tracking-wider">
            {group.title}
          </h4>
          {group.items.map((link) => (
            <NavigationMenuLink asChild key={link.href}>
              <Link
                className="flex items-start gap-2 rounded-md px-1.5 py-1 transition-colors"
                href={link.href}
              >
                {link.icon && (
                  <HugeiconsIcon
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    icon={link.icon}
                    strokeWidth={2}
                  />
                )}
                <div>
                  <div className="font-medium text-xs leading-tight">
                    {link.title}
                  </div>
                  {link.description && (
                    <p className="text-[0.625rem] text-muted-foreground leading-snug">
                      {link.description}
                    </p>
                  )}
                </div>
              </Link>
            </NavigationMenuLink>
          ))}
        </div>
      ))}
    </div>
  );
}

function SimpleDropdownContent({ item }: { item: NavItem }) {
  if (!item.items) {
    return null;
  }
  return (
    <div className="w-[220px] p-1.5">
      {item.items.map((link) => (
        <NavigationMenuLink asChild key={link.href}>
          <Link
            className="flex items-center gap-2 rounded-md p-2 transition-colors"
            href={link.href}
          >
            {link.icon && (
              <HugeiconsIcon
                className="size-4 text-muted-foreground"
                icon={link.icon}
                strokeWidth={2}
              />
            )}
            <span className="text-xs">{link.title}</span>
          </Link>
        </NavigationMenuLink>
      ))}
    </div>
  );
}

export function NavbarDesktop() {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.href && !item.groups && !item.items ? (
              <NavigationMenuLink
                asChild
                className={cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent"
                )}
              >
                <Link href={item.href}>{item.title}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger className="cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-popup-open:bg-transparent data-open:focus:bg-transparent data-open:hover:bg-transparent data-popup-open:hover:bg-transparent">
                  {item.title}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.groups ? (
                    <MegaMenuContent item={item} />
                  ) : (
                    <SimpleDropdownContent item={item} />
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
