# Lumon — Next.js + Payload CMS Template

## Stack

- **Runtime**: Next.js 16 (App Router) + React 19
- **Package manager**: Bun
- **Styling**: Tailwind CSS v4 (PostCSS plugin, no tailwind.config)
- **Components**: shadcn (Base UI / radix-mira style) — UI primitives in `src/components/ui/`
- **Icons**: Hugeicons (`@hugeicons/react`)
- **Charts**: Recharts
- **Themes**: next-themes (class-based, system default)
- **CMS**: Payload CMS (to be added)
- **Code quality**: Ultracite (Biome-based) — `bun check` / `bun fix`
- **Linting**: ESLint with next core-web-vitals + TypeScript

## Conventions

- Use `bun` for all package operations
- Run `bun check` before committing
- Use `cn()` from `@/core/lib/utils` for conditional class merging
- Fonts: Nunito Sans (sans) + Geist Mono (mono)
- Color theme uses oklch color space — defined in `src/app/globals.css`
- Path aliases: `@/*` → `src/*`
  - `@/components/ui` — shadcn primitives
  - `@/components/blocks` — Payload blocks
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
  core/             — Upstream-safe agnostic code (hooks, utils)
    hooks/          — Generic reusable hooks
    lib/            — Generic utilities (cn, helpers)
  components/       — All UI rendering
    ui/             — shadcn UI primitives (generated, don't hand-edit)
    blocks/         — Payload CMS content blocks
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
