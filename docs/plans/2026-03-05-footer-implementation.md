# Footer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 3-zone multi-column SaaS footer with newsletter banner, link columns with social icons, and legal row.

**Architecture:** Data-driven footer mirroring the navbar pattern — `footer-data.ts` defines all links, `footer.tsx` renders three zones (newsletter, links, legal), and `newsletter-form.tsx` handles the client-side email form. Integrated into the root layout below `<main>`.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS v4, shadcn (Input, Button), Hugeicons, Bun

---

### Task 1: Create footer data

**Files:**
- Create: `src/components/layout/footer/footer-data.ts`

**Step 1: Create the footer data file**

```ts
import type { IconSvgElement } from "@hugeicons/react";
import {
  GithubIcon,
  Linkedin01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";

export interface FooterLinkColumn {
  links: { href: string; title: string }[];
  title: string;
}

export interface SocialLink {
  href: string;
  icon: IconSvgElement;
  label: string;
}

export const footerColumns: FooterLinkColumn[] = [
  {
    title: "Product",
    links: [
      { title: "Analytics", href: "/products/analytics" },
      { title: "Dashboard", href: "/products/dashboard" },
      { title: "Cloud", href: "/products/cloud" },
      { title: "API", href: "/products/api" },
      { title: "Integrations", href: "/products/integrations" },
      { title: "Security", href: "/products/security" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { title: "Marketing", href: "/solutions/marketing" },
      { title: "Sales", href: "/solutions/sales" },
      { title: "Engineering", href: "/solutions/engineering" },
      { title: "Startups", href: "/solutions/startups" },
      { title: "Enterprise", href: "/solutions/enterprise" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Documentation", href: "/docs" },
      { title: "Support", href: "/support" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Careers", href: "/careers" },
      { title: "Press", href: "/press" },
      { title: "Legal", href: "/legal" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "X", href: "https://x.com", icon: NewTwitterIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin01Icon },
];

export const legalLinks = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
];
```

**Step 2: Run lint to verify**

Run: `bun check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/footer/footer-data.ts
git commit -m "feat(footer): add footer data"
```

---

### Task 2: Create newsletter form component

**Files:**
- Create: `src/components/layout/footer/newsletter-form.tsx`

**Step 1: Create the newsletter form**

This is a `"use client"` component because it uses form interactivity (visual-only for now, no actual submission).

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h3 className="text-lg font-semibold">Stay up to date</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get the latest news and updates delivered to your inbox.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          className="flex-1"
          placeholder="Enter your email"
          type="email"
        />
        <Button type="submit">Subscribe</Button>
      </form>
    </div>
  );
}
```

**Step 2: Run lint to verify**

Run: `bun check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/footer/newsletter-form.tsx
git commit -m "feat(footer): add newsletter form component"
```

---

### Task 3: Create main footer component

**Files:**
- Create: `src/components/layout/footer/footer.tsx`

**Step 1: Create the footer component**

This is a server component (no `"use client"`). It imports the client `NewsletterForm` and renders all three zones.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import {
  footerColumns,
  legalLinks,
  socialLinks,
} from "./footer-data";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Zone 1: Newsletter */}
        <div className="border-b py-8">
          <NewsletterForm />
        </div>

        {/* Zone 2: Link columns */}
        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-6">
          {/* Logo column */}
          <div className="lg:col-span-2">
            <Link className="inline-block" href="/">
              <span className="font-semibold text-base tracking-tight">
                Lumon
                <span className="text-muted-foreground">Payload</span>
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Next.js + Payload CMS template and component showcase.
            </p>
            <div className="mt-4 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  href={social.href}
                  key={social.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <HugeiconsIcon
                    className="size-4"
                    icon={social.icon}
                    strokeWidth={2}
                  />
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground">
                {column.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Zone 3: Legal */}
        <div className="flex flex-col items-center justify-between gap-4 border-t py-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Lumon Industries. All rights reserved.
          </p>
          <div className="flex gap-4">
            {legalLinks.map((link) => (
              <Link
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                href={link.href}
                key={link.href}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Run lint to verify**

Run: `bun check`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/layout/footer/footer.tsx
git commit -m "feat(footer): add main footer component"
```

---

### Task 4: Integrate footer into root layout

**Files:**
- Modify: `src/app/layout.tsx:3,34`

**Step 1: Add Footer import and render it after `<main>`**

Add this import after the Navbar import (line 3):
```ts
import { Footer } from "@/components/layout/footer/footer";
```

Replace line 34 (`<main>{children}</main>`) with:
```tsx
<main>{children}</main>
<Footer />
```

The full layout body should look like:
```tsx
<Providers>
  <Navbar />
  <main>{children}</main>
  <Footer />
</Providers>
```

**Step 2: Run lint to verify**

Run: `bun check`
Expected: No errors

**Step 3: Verify visually**

Open `http://localhost:3001` in the browser. Scroll down to verify:
- Newsletter banner with email input and subscribe button
- Logo column with tagline and social icons
- 4 link columns (Product, Solutions, Resources, Company)
- Legal row with copyright and privacy/terms links
- Dark mode: toggle theme and verify footer looks correct
- Responsive: resize to mobile width and verify grid collapses properly

**Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(footer): integrate footer into root layout"
```
