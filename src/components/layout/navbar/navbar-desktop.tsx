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
import type { NavGroup, NavItem } from "./navbar-data";
import { navItems } from "./navbar-data";

function MegaMenuContent({ item }: { item: NavItem }) {
  if (!item.groups) {
    return null;
  }
  return (
    <div className="grid gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-2">
      {item.groups.map((group: NavGroup) => (
        <div className="space-y-2" key={group.title}>
          <h4 className="px-2 font-medium text-[0.6875rem] text-muted-foreground uppercase tracking-wider">
            {group.title}
          </h4>
          <div className="space-y-0.5">
            {group.items.map((link) => (
              <NavigationMenuLink asChild key={link.href}>
                <Link
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                  href={link.href}
                >
                  {link.icon && (
                    <HugeiconsIcon
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      icon={link.icon}
                      strokeWidth={2}
                    />
                  )}
                  <div>
                    <div className="font-medium text-xs">{link.title}</div>
                    {link.description && (
                      <p className="text-[0.6875rem] text-muted-foreground leading-relaxed">
                        {link.description}
                      </p>
                    )}
                  </div>
                </Link>
              </NavigationMenuLink>
            ))}
          </div>
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
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
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
                className={navigationMenuTriggerStyle()}
              >
                <Link href={item.href}>{item.title}</Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
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
