# Lumon — Next.js + Payload CMS Template

## Stack

- **Runtime**: Next.js 16 (App Router) + React 19
- **Package manager**: Bun
- **Styling**: Tailwind CSS v4 (PostCSS plugin, no tailwind.config)
- **Components**: shadcn (Base UI / radix-mira style) — UI primitives in `src/components/ui/`
- **Icons**: Hugeicons (`@hugeicons/react`)
- **Charts**: Recharts
- **Themes**: next-themes (class-based, system default)
- **CMS**: Payload CMS 3.x (SQLite/libsql, S3 storage via Railway)
- **Database**: libsql on Railway (`libsql://libsql-production-9f2c.up.railway.app`)
- **Object Storage**: Railway S3 bucket (`lumon-media`) for media uploads
- **Code quality**: Ultracite (Biome-based) — `bun check` / `bun fix`
- **Linting**: ESLint with next core-web-vitals + TypeScript

## Conventions

- Use `bun` for all package operations
- Run `bun check` before committing
- Use `cn()` from `@/core/lib/utils` for conditional class merging
- Fonts: Nunito Sans (sans) + Geist Mono (mono)
- Color theme uses oklch color space — defined in `src/app/globals.css`
- Path aliases: `@/*` → `src/*`
  - `@/payload` — Payload CMS schemas, collections, hooks, jobs, utilities
  - `@/components/ui` — shadcn primitives
  - `@/components/blocks` — Payload block components + render-blocks mapper
  - `@/components/layout` — structural components (navbar, footer)
  - `@/components/features` — feature components
  - `@/core/lib` — generic utilities
  - `@/core/hooks` — generic hooks
  - `@/types` — project types
  - `@/providers` — context providers

## Project Structure

```
src/
  app/              — Next.js App Router pages and layouts
  payload/          — All Payload CMS concerns
    block-schemas/  — Block field definitions (Hero, Bento, etc.)
    collections/    — Data models (Users, Media, Pages)
    hooks/          — Collection & field hooks
    jobs/           — Async job tasks (video optimization)
    lib/            — Payload-specific utilities (ffmpeg, downloads)
  core/             — Upstream-safe agnostic code (hooks, utils)
    hooks/          — Generic reusable hooks
    lib/            — Generic utilities (cn, helpers)
  components/       — All UI rendering
    ui/             — shadcn UI primitives (generated, don't hand-edit)
    blocks/         — Payload block components + render-blocks mapper
    layout/         — Structural components (navbar, footer)
    features/       — Feature-level composed components
  types/            — Project-specific TypeScript types
  providers/        — Context providers (theme, etc.)
scripts/            — CLI scripts (seed, migrate, codegen)
docs/plans/         — Design documents
```

## Commands

- `bun dev` — Start dev server
- `bun build` — Production build
- `bun check` — Lint and format check (Ultracite)
- `bun fix` — Auto-fix lint and format issues

## cmux (Terminal Multiplexer)

This project runs in cmux. Prefer cmux browser over Playwright MCP — it shares the
same visible browser the user sees.

### Essential commands

```bash
# Browser — open, screenshot, interact
cmux browser open http://localhost:3000              # opens browser split, returns surface ref
cmux browser surface:N screenshot --out /tmp/s.png   # take screenshot (viewable with Read tool)
cmux browser surface:N eval "JS expression; 'ok'"    # run JS, return result
cmux browser surface:N reload                        # reload page
cmux browser surface:N wait --load-state complete    # wait for page load
cmux browser surface:N snapshot --interactive        # get DOM accessibility tree
cmux browser surface:N click "selector"              # click element
cmux browser surface:N scroll-into-view "selector"   # scroll to element

# Notifications
cmux notify --title "Title" --body "Body"

# Sidebar
cmux set-status key "value" --icon name --color "#hex"
cmux set-progress 0.5 --label "Building..."
cmux log --level success "Message"

# Terminal I/O
cmux read-screen --surface surface:N --scrollback --lines 50
cmux send --surface surface:N "command\n"
```

See `.agents/skills/cmux/` for the full skill with complete reference docs.

## Design Consistency

When building or modifying UI components, use both skills together:

- **`design-language`** — The process for maintaining visual consistency. Read this first to understand *how* to audit existing patterns and replicate them faithfully.
- **`theme`** — The exact values for this project's Severance/Lumon aesthetic: animation constants, typography classes, spacing tokens, color system, copy voice. This is the reference card — swap it when forking for a new client.

Use these whenever creating new sections, components, or pages. The theme skill has every pattern pre-extracted so you don't need to read multiple components to figure out the conventions.

## Finding & Installing Skills

When you encounter a task outside your current skillset — or the user asks "how do I do X", "can you do X", or "is there a skill for X" — use the `find-skills` skill to search the open agent skills ecosystem via `npx skills find [query]`. Install with `npx skills add <owner/repo@skill> -g -y`. Browse available skills at https://skills.sh/.

## Payload CMS

### Architecture

- **Route groups**: `(frontend)` for public site, `(payload)` for admin panel + REST API
- **No root layout.tsx** — each route group has its own root layout. This is required so Payload's `RootLayout` gets full control of `<html>`/`<body>` for admin routes. The `(payload)/layout.tsx` must import `@payloadcms/next/css`.
- **Config**: `src/payload.config.ts` — collections, plugins, db adapter, S3 storage
- **Payload directory**: `src/payload/` — block schemas, collections, hooks, jobs, utilities
- **Collections**: `src/payload/collections/` — Users, Media, Pages (with layout blocks field)
- **Block schemas**: `src/payload/block-schemas/` — Hero, Bento, SplitMedia, Testimonials, ImageGallery, LatestArticles, CinematicCta, Pricing, Faq, Trust
- **Block components**: `src/components/blocks/` — React renderers mapped via `render-blocks.tsx`
- **Page rendering**: SSR catch-all `(frontend)/[[...slug]]/page.tsx` fetches pages via Payload Local API
- **Operations**: Use the `payload-ops` skill for step-by-step recipes when adding blocks, collections, or modifying schemas. It encodes the project's naming conventions, file locations, and type system patterns.

### Payload MCP

The `@payloadcms/plugin-mcp` is configured and connected via `.mcp.json`. It uses HTTP transport at `http://localhost:3000/api/mcp` with Bearer token auth.

**Available MCP tools** (require dev server running):
- `mcp__payload__findPages` / `createPages` / `updatePages` / `deletePages`
- `mcp__payload__findMedia` / `createMedia` / `updateMedia` / `deleteMedia`
- `mcp__payload__findCollections` / `createCollection`
- `mcp__payload__findConfig` / `updateConfig`

**Key learnings**:
- Media fields in blocks expect Payload media IDs (numbers), not URLs
- Upload media via REST API with multipart form: `-F "file=@path" -F "_payload={\"alt\":\"...\"};type=application/json"`
- The MCP `createMedia` tool cannot upload files — use the REST API for uploads, then reference IDs in MCP calls
- To create a page with blocks, media must exist first (FK constraint)
- `createPages` fails if a page with the same slug exists — use `updatePages` instead
- API key for MCP is managed via admin panel: MCP > API Keys. Enable the checkbox and save to generate a key.

### Admin credentials

- **URL**: `http://localhost:3000/admin`
- **Email**: `jordanburch.dev@gmail.com`
- **Password**: `meta1234`

## Figma

See the `figma-workflow` skill (`.agents/skills/figma-workflow/SKILL.md`) for complete Figma MCP workflows, tool reference, project token mapping, and the code-to-Figma capture process. Design file: `WphchqX8oXptbsxPi33oE5`.
