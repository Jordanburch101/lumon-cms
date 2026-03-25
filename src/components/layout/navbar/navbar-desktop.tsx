import { CMSLink } from "@/components/ui/cms-link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/core/lib/utils";
import type { Header } from "@/payload-types";
import { CmsIcon } from "../shared/cms-icon";

type NavItems = NonNullable<Header["navItems"]>;

/* Extract the mega-menu block type for prop typing */
type MegaMenuBlock = Extract<NavItems[number], { blockType: "mega-menu" }>;
type MegaMenuGroup = NonNullable<MegaMenuBlock["groups"]>[number];

/* Extract the dropdown block type for prop typing */
type DropdownBlock = Extract<NavItems[number], { blockType: "dropdown" }>;
type DropdownItem = NonNullable<DropdownBlock["items"]>[number];

function MegaMenuContent({
  groups,
}: {
  groups: NonNullable<MegaMenuBlock["groups"]>;
}) {
  return (
    <div className="grid gap-2 p-2 md:w-[460px] lg:w-[540px] lg:grid-cols-2">
      {groups.map((group: MegaMenuGroup) => (
        <div className="space-y-0.5" key={group.id ?? group.groupLabel}>
          <h4 className="px-1.5 pb-0.5 font-medium text-[0.625rem] text-muted-foreground uppercase tracking-wider">
            {group.groupLabel}
          </h4>
          {(group.items ?? []).map((item) => (
            <CMSLink
              className="flex items-start gap-2 rounded-md px-1.5 py-1 transition-colors"
              key={item.id ?? item.link.label}
              link={item.link}
            >
              {item.icon && (
                <CmsIcon
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                  name={item.icon}
                />
              )}
              <div>
                <div className="font-medium text-xs leading-tight">
                  {item.link.label}
                </div>
                {item.description && (
                  <p className="text-[0.625rem] text-muted-foreground leading-snug">
                    {item.description}
                  </p>
                )}
              </div>
            </CMSLink>
          ))}
        </div>
      ))}
    </div>
  );
}

function SimpleDropdownContent({
  items,
}: {
  items: NonNullable<DropdownBlock["items"]>;
}) {
  return (
    <div className="w-[220px] p-1.5">
      {items.map((item: DropdownItem) => (
        <CMSLink
          className="flex items-center gap-2 rounded-md p-2 transition-colors"
          key={item.id ?? item.link.label}
          link={item.link}
        >
          {item.icon && (
            <CmsIcon
              className="size-4 text-muted-foreground"
              name={item.icon}
            />
          )}
          <span className="text-xs">{item.link.label}</span>
        </CMSLink>
      ))}
    </div>
  );
}

export function NavbarDesktop({ navItems }: { navItems: NavItems }) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem
            key={item.id ?? ("label" in item ? item.label : item.link.label)}
          >
            {item.blockType === "direct-link" ? (
              <CMSLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent"
                )}
                link={item.link}
              />
            ) : item.blockType === "mega-menu" ? (
              <>
                <NavigationMenuTrigger className="cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-popup-open:bg-transparent data-open:focus:bg-transparent data-open:hover:bg-transparent data-popup-open:hover:bg-transparent">
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <MegaMenuContent groups={item.groups ?? []} />
                </NavigationMenuContent>
              </>
            ) : (
              <>
                <NavigationMenuTrigger className="cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-popup-open:bg-transparent data-open:focus:bg-transparent data-open:hover:bg-transparent data-popup-open:hover:bg-transparent">
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <SimpleDropdownContent items={item.items ?? []} />
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
