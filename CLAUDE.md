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

## Figma

See the `figma-workflow` skill (`.agents/skills/figma-workflow/SKILL.md`) for complete Figma MCP workflows, tool reference, project token mapping, and the code-to-Figma capture process. Design file: `WphchqX8oXptbsxPi33oE5`.
