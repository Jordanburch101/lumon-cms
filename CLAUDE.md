# Lumon — Next.js + Payload CMS Template

## Stack

- **Runtime**: Next.js 16 (App Router) + React 19
- **Package manager**: Bun
- **Styling**: Tailwind CSS v4 (PostCSS plugin, no tailwind.config)
- **Components**: shadcn (Base UI / radix-mira style) — 57 UI components in `components/ui/`
- **Icons**: Hugeicons (`@hugeicons/react`)
- **Charts**: Recharts
- **Themes**: next-themes (class-based, system default)
- **CMS**: Payload CMS (to be added)
- **Code quality**: Ultracite (Biome-based) — `bun check` / `bun fix`
- **Linting**: ESLint with next core-web-vitals + TypeScript

## Conventions

- Use `bun` for all package operations
- Run `bun check` before committing
- Components go in `components/`, UI primitives in `components/ui/`
- Use `cn()` from `@/lib/utils` for conditional class merging
- Path aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
- Fonts: Nunito Sans (sans) + Geist Mono (mono)
- Color theme uses oklch color space — defined in `app/globals.css`

## Project Structure

```
app/            — Next.js App Router pages and layouts
components/     — React components
  ui/           — shadcn UI primitives (do not edit directly)
hooks/          — Custom React hooks
lib/            — Utility functions
public/         — Static assets
docs/plans/     — Design documents
```

## Commands

- `bun dev` — Start dev server
- `bun build` — Production build
- `bun check` — Lint and format check (Ultracite)
- `bun fix` — Auto-fix lint and format issues
