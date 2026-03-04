# Header/Nav Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-featured sticky header with mega menu navigation, mobile sheet menu, search trigger, theme toggle, and CTA button.

**Architecture:** Navbar is a layout component at `src/components/layout/navbar/` with separate desktop and mobile components. Uses shadcn NavigationMenu for desktop mega menus, Sheet + Accordion for mobile. Fake nav data in a separate data file. Theme toggle uses next-themes. Scroll detection via a useScrolled hook.

**Tech Stack:** NavigationMenu (radix-ui), Sheet, Accordion, Button (shadcn), next-themes, Hugeicons, Next.js Image

---

### Task 1: Copy logo and create navbar data file

**Files:**
- Copy: `~/Downloads/lumon_globe_logo.svg` → `public/lumon-logo.svg`
- Create: `src/components/layout/navbar/navbar-data.ts`

**Step 1: Copy logo to public/ and fix colors for dark mode**

Copy `~/Downloads/lumon_globe_logo.svg` to `public/lumon-logo.svg`. Update the SVG to use `currentColor` instead of `rgb(0, 0, 0)` for both paths so it works in dark mode.

**Step 2: Create the fake navigation data**

Create `src/components/layout/navbar/navbar-data.ts`:

```typescript
import type { IconType } from "@hugeicons/react";
import {
  AnalyticsUpIcon,
  ChartIcon,
  CloudIcon,
  CodeIcon,
  DashboardSquare01Icon,
  FileIcon,
  HeadphonesIcon,
  LaptopIcon,
  MailIcon,
  NewspaperIcon,
  ShieldIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export type NavLinkItem = {
  title: string;
  href: string;
  description?: string;
  icon?: IconType;
};

export type NavGroup = {
  title: string;
  items: NavLinkItem[];
};

export type NavItem = {
  title: string;
  href?: string;
  groups?: NavGroup[];
  items?: NavLinkItem[];
};

export const navItems: NavItem[] = [
  {
    title: "Products",
    groups: [
      {
        title: "Platform",
        items: [
          {
            title: "Analytics",
            href: "/products/analytics",
            description: "Track and measure what matters",
            icon: AnalyticsUpIcon,
          },
          {
            title: "Dashboard",
            href: "/products/dashboard",
            description: "Visualize your data in real time",
            icon: DashboardSquare01Icon,
          },
          {
            title: "Cloud",
            href: "/products/cloud",
            description: "Scalable infrastructure for teams",
            icon: CloudIcon,
          },
        ],
      },
      {
        title: "Tools",
        items: [
          {
            title: "API",
            href: "/products/api",
            description: "Build with our developer platform",
            icon: CodeIcon,
          },
          {
            title: "Integrations",
            href: "/products/integrations",
            description: "Connect your favorite tools",
            icon: LaptopIcon,
          },
          {
            title: "Security",
            href: "/products/security",
            description: "Enterprise-grade protection",
            icon: ShieldIcon,
          },
        ],
      },
    ],
  },
  {
    title: "Solutions",
    groups: [
      {
        title: "By Use Case",
        items: [
          {
            title: "Marketing",
            href: "/solutions/marketing",
            description: "Grow your audience and convert",
            icon: ChartIcon,
          },
          {
            title: "Sales",
            href: "/solutions/sales",
            description: "Close deals faster with insights",
            icon: AnalyticsUpIcon,
          },
          {
            title: "Engineering",
            href: "/solutions/engineering",
            description: "Ship better products, faster",
            icon: CodeIcon,
          },
        ],
      },
      {
        title: "By Team Size",
        items: [
          {
            title: "Startups",
            href: "/solutions/startups",
            description: "Move fast with the right tools",
            icon: UserGroupIcon,
          },
          {
            title: "Enterprise",
            href: "/solutions/enterprise",
            description: "Scale with confidence",
            icon: CloudIcon,
          },
        ],
      },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Blog", href: "/blog", icon: NewspaperIcon },
      { title: "Documentation", href: "/docs", icon: FileIcon },
      { title: "Support", href: "/support", icon: HeadphonesIcon },
      { title: "Contact", href: "/contact", icon: MailIcon },
    ],
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];
```

**Step 3: Commit**

```bash
git add public/lumon-logo.svg src/components/layout/navbar/navbar-data.ts
git commit -m "feat: add logo and navbar navigation data

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create theme toggle and search trigger

**Files:**
- Create: `src/components/layout/navbar/theme-toggle.tsx`
- Create: `src/components/layout/navbar/search-trigger.tsx`

**Step 1: Create theme toggle**

Create `src/components/layout/navbar/theme-toggle.tsx`:

```tsx
"use client";

import { MoonIcon, SunIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <HugeiconsIcon
        icon={SunIcon}
        strokeWidth={2}
        className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90"
      />
      <HugeiconsIcon
        icon={MoonIcon}
        strokeWidth={2}
        className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
      />
    </Button>
  );
}
```

**Step 2: Create search trigger**

Create `src/components/layout/navbar/search-trigger.tsx`:

```tsx
import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

export function SearchTrigger() {
  return (
    <Button variant="ghost" size="icon" aria-label="Search">
      <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-4" />
    </Button>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/layout/navbar/theme-toggle.tsx src/components/layout/navbar/search-trigger.tsx
git commit -m "feat: add theme toggle and search trigger components

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create desktop navigation

**Files:**
- Create: `src/components/layout/navbar/navbar-desktop.tsx`

**Step 1: Create the desktop navigation component**

Create `src/components/layout/navbar/navbar-desktop.tsx`. This uses NavigationMenu from shadcn. Key behaviors:
- Renders navItems from navbar-data.ts
- Items with `groups` render as mega menu panels (grid layout with grouped links, icons, descriptions)
- Items with `items` (no groups) render as simple dropdown lists
- Items with just `href` render as plain links
- Each mega menu link shows an icon, title, and description

```tsx
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
import { navItems, type NavItem, type NavGroup } from "./navbar-data";

function MegaMenuContent({ item }: { item: NavItem }) {
  if (!item.groups) return null;
  return (
    <div className="grid gap-3 p-4 md:w-[500px] lg:w-[600px] lg:grid-cols-2">
      {item.groups.map((group: NavGroup) => (
        <div key={group.title} className="space-y-2">
          <h4 className="px-2 font-medium text-muted-foreground text-[0.6875rem] uppercase tracking-wider">
            {group.title}
          </h4>
          <div className="space-y-0.5">
            {group.items.map((link) => (
              <NavigationMenuLink key={link.href} asChild>
                <Link
                  href={link.href}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  {link.icon && (
                    <HugeiconsIcon
                      icon={link.icon}
                      strokeWidth={2}
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                  )}
                  <div>
                    <div className="font-medium text-xs">{link.title}</div>
                    {link.description && (
                      <p className="text-muted-foreground text-[0.6875rem] leading-relaxed">
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
  if (!item.items) return null;
  return (
    <div className="w-[220px] p-1.5">
      {item.items.map((link) => (
        <NavigationMenuLink key={link.href} asChild>
          <Link
            href={link.href}
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted"
          >
            {link.icon && (
              <HugeiconsIcon
                icon={link.icon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
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
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
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
```

**Step 2: Commit**

```bash
git add src/components/layout/navbar/navbar-desktop.tsx
git commit -m "feat: add desktop navigation with mega menus

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Create mobile navigation

**Files:**
- Create: `src/components/layout/navbar/navbar-mobile.tsx`

**Step 1: Create the mobile navigation component**

Create `src/components/layout/navbar/navbar-mobile.tsx`. Uses Sheet (slide from right) with Accordion for expandable sections. Key behaviors:
- Hamburger button triggers Sheet open
- Each nav item with children becomes an Accordion section
- Plain links render directly
- Theme toggle and search at the bottom
- CTA button at the very bottom

```tsx
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
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { navItems } from "./navbar-data";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

export function NavbarMobile() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <div className="flex-1 px-6 py-4">
            <Accordion type="multiple" className="border-none">
              {navItems.map((item) => {
                if (item.href && !item.groups && !item.items) {
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex h-10 items-center border-b px-2 font-medium text-xs"
                    >
                      {item.title}
                    </Link>
                  );
                }

                const links = item.groups
                  ? item.groups.flatMap((g) => g.items)
                  : item.items ?? [];

                return (
                  <AccordionItem key={item.title} value={item.title}>
                    <AccordionTrigger>{item.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-1">
                        {links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="rounded-md px-2 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
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
```

**Step 2: Commit**

```bash
git add src/components/layout/navbar/navbar-mobile.tsx
git commit -m "feat: add mobile navigation with sheet and accordion

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Create main navbar wrapper and integrate into layout

**Files:**
- Create: `src/core/hooks/use-scrolled.ts`
- Create: `src/components/layout/navbar/navbar.tsx`
- Create: `src/components/layout/navbar/index.ts`
- Modify: `src/app/layout.tsx`

**Step 1: Create useScrolled hook**

Create `src/core/hooks/use-scrolled.ts`:

```typescript
"use client";

import { useEffect, useState } from "react";

export function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}
```

**Step 2: Create main navbar component**

Create `src/components/layout/navbar/navbar.tsx`:

```tsx
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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/lumon-logo.svg"
            alt="Lumon"
            width={120}
            height={28}
            className="dark:invert"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <NavbarDesktop />

        {/* Right side - Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          <SearchTrigger />
          <ThemeToggle />
          <Button size="default" className="ml-2">
            Get Started
          </Button>
        </div>

        {/* Mobile */}
        <NavbarMobile />
      </div>
    </header>
  );
}
```

**Step 3: Create barrel export**

Create `src/components/layout/navbar/index.ts`:

```typescript
export { Navbar } from "./navbar";
```

**Step 4: Add Navbar to root layout**

Modify `src/app/layout.tsx` — add the Navbar import and render it above `{children}`:

```tsx
import type { Metadata } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/providers/providers";
import "./globals.css";

// ... fonts and metadata stay the same ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

**Step 5: Run build to verify everything compiles**

```bash
bun run build
```

Expected: PASS

**Step 6: Run lint check**

```bash
bun check
```

Expected: PASS (navbar files are outside components/ui so they get linted)

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add navbar to layout with scroll effects and responsive design

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Visual verification

**Step 1: Start dev server and verify**

```bash
bun dev
```

Verify in browser at http://localhost:3000:
- [ ] Logo visible top-left
- [ ] Desktop: mega menus open on hover/click for Products and Solutions
- [ ] Desktop: Resources shows simple dropdown
- [ ] Desktop: Pricing is a plain link
- [ ] Desktop: Search icon, theme toggle, and "Get Started" button visible on right
- [ ] Theme toggle switches between light and dark mode
- [ ] Scroll down: header gets backdrop blur and border
- [ ] Resize to mobile: hamburger icon appears, desktop nav hides
- [ ] Mobile: sheet slides from right with accordion navigation
- [ ] Mobile: CTA and toggles at bottom of sheet
