# Lumon Payload

A production-grade Next.js + Payload CMS template with a Severance-inspired design system. Built for teams who ship — fork it, swap the theme, and launch.

## Live Links

- **Storybook** (component catalogue): [jordanburch101.github.io/lumon-cms](https://jordanburch101.github.io/lumon-cms/)

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19) |
| CMS | Payload CMS 3.x (integrated, not headless) |
| Styling | Tailwind CSS v4 (oklch color system) |
| Components | shadcn/ui (Base UI primitives) |
| Database | libsql on Railway |
| Media | Railway S3 bucket |
| Icons | Hugeicons |
| Animations | Motion (framer-motion) |
| Package Manager | Bun |
| Hosting | Railway (app) + GitHub Pages (Storybook) |

## Blocks

18 content blocks, all CMS-editable with live preview:

**Heroes** — Hero, Hero Centered, Hero Minimal, Hero Stats

**Content** — Features Grid, Bento, Split Media, Image Gallery, Latest Articles, Rich Text Content

**Social Proof** — Testimonials, Team, Trust, Logo Cloud

**CTAs** — CTA Band (primary/card variants), Cinematic CTA

**Commerce** — Pricing (3-tier with toggle), FAQ (accordion)

## Storybook

Every block has an auto-generated Storybook story with interactive controls matching Payload's field types. Fixtures are typed against Payload's generated types — add a block, add fixture data, stories appear automatically.

```bash
bun storybook        # Dev server on port 6006
bun storybook:build  # Static build
```

**Features:**
- Interactive Controls panel (edit headings, toggle variants, tweak props)
- Light/dark theme toggle
- Responsive viewport presets (Mobile, sm, md, lg, xl)
- Accessibility audit panel (axe-core)
- Performance metrics panel
- Auto-generated documentation pages per category

**Auto-deploys** to GitHub Pages on every push to main.

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Lint & format
bun check
bun fix

# Production build
bun run build
```

## Project Structure

```
src/
  app/                — Next.js App Router (route groups: frontend + payload)
  payload/            — CMS schemas, collections, hooks, editor config
  components/
    blocks/           — 18 block components + render-blocks mapper
    ui/               — shadcn primitives
    layout/           — Navbar, footer
    features/         — Rich text, admin bar, editor overlays
  core/               — Upstream-safe utilities and hooks
.storybook/           — Storybook config + story generator
.github/workflows/    — CI: Storybook deployment to GitHub Pages
```

## Design System

The Severance/Lumon aesthetic is fully tokenized — oklch colors, Nunito Sans + Geist Mono typography, liquid glass effects, scroll-triggered animations. Fork the project and swap `globals.css` + the theme skill to rebrand for a client.

## License

Private template. Not open source.
