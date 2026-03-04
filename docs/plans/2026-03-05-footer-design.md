# Footer Design

**Goal:** Multi-column SaaS footer with newsletter banner, link columns, social icons, and legal row.

**Approach:** 3-zone structured footer matching the navbar's compact aesthetic and data-driven pattern.

---

## Structure

Container: `max-w-7xl` with `px-4 lg:px-6` (matches navbar). Full-width `<footer>` with `border-t bg-background`.

### Zone 1: Newsletter Banner

- `py-8` with `border-b` separator
- Centered: headline ("Stay up to date"), short description, inline email `<Input>` + `<Button>`
- `"use client"` component (`newsletter-form.tsx`) for form state (visual-only for now)
- Mobile: stacks vertically

### Zone 2: Link Columns

- `py-8`, 5-column responsive grid
- **Logo column** (col-span-2 on lg): "LumonPayload" text logo, one-line tagline, social icons row (GitHub, X/Twitter, LinkedIn via Hugeicons)
- **4 link columns:** Product, Solutions, Resources, Company — column header + vertical link list
- Mobile: logo full-width, link columns collapse to 2x2 grid

### Zone 3: Legal Row

- `py-4 border-t`
- Copyright on left, Privacy Policy + Terms of Service links on right
- Mobile: stacks centered

---

## Files

- `src/components/layout/footer/footer-data.ts` — flat link columns, social links, legal links
- `src/components/layout/footer/footer.tsx` — main component, renders all three zones
- `src/components/layout/footer/newsletter-form.tsx` — "use client" email input + button

---

## Data

**Link columns (fake data):**
- Product: Analytics, Dashboard, Cloud, API, Integrations, Security
- Solutions: Marketing, Sales, Engineering, Startups, Enterprise
- Resources: Blog, Documentation, Support, Contact
- Company: About, Careers, Press, Legal

**Social links:** GitHub, X/Twitter, LinkedIn

**Legal links:** Privacy Policy, Terms of Service

---

## Visual Style

- Column headers: `text-xs font-medium uppercase tracking-wider text-muted-foreground`
- Links: `text-sm text-muted-foreground hover:text-foreground transition-colors`
- Legal text: `text-xs text-muted-foreground`
- Newsletter headline: `text-lg font-semibold`, description: `text-sm text-muted-foreground`
- Social icons: `size-4 text-muted-foreground hover:text-foreground transition-colors`, `gap-3`
- Spacing: `py-8` newsletter/links zones, `py-4` legal, `space-y-2` link lists, grid `gap-8`
- No background color changes — `bg-background` with `border-t`

---

## UI Components

- `Input`, `Button` from shadcn
- `HugeiconsIcon` from `@hugeicons/react`
- Social icons from `@hugeicons/core-free-icons`
