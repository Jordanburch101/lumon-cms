# Header/Nav Design

## Context

First layout component for the template/showcase project. Full-featured header with mega menus, mobile sheet menu, search trigger, theme toggle, and CTA.

## Design

### Structure
- Sticky header with backdrop blur on scroll
- Desktop: Logo (left) | Mega menu nav links (center) | Search trigger + Theme toggle + CTA button (right)
- Mobile: Logo (left) | Hamburger (right) → Sheet slides from right

### Mega Menu (Desktop)
Uses shadcn NavigationMenu component. Each nav item with children opens a wide panel below the header with grouped links, icons, and descriptions.

Fake nav data:
- **Products** (mega) — Grid of product cards with icons + descriptions
- **Solutions** (mega) — Industry/use-case grouped links
- **Resources** (simple dropdown) — Blog, Docs, Support
- **Pricing** (plain link, no dropdown)

### Mobile Menu (Sheet)
- Sheet from right using existing Sheet component
- Accordion sections matching desktop nav structure
- Search, theme toggle, and CTA at bottom of sheet

### Scroll Behavior
- Transparent/minimal at top
- On scroll: `bg-background/80 backdrop-blur border-b`

### Components

All in `src/components/layout/navbar/`:
- `navbar.tsx` — Main export, sticky wrapper with scroll detection
- `navbar-desktop.tsx` — Desktop nav with NavigationMenu mega menus
- `navbar-mobile.tsx` — Mobile sheet with accordion nav
- `navbar-data.ts` — Fake navigation data (links, groups, icons)
- `theme-toggle.tsx` — Dark/light mode toggle button
- `search-trigger.tsx` — Search button (visual only for now)
