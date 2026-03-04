# Folder Structure Redesign

## Context

Reorganizing from flat root-level directories into a `src/` structure with a `core/` directory for upstream-mergeable agnostic code. The template is designed to be forked for client sites, with `core/` changes pulled back upstream.

## Design Principles

- **`core/` is fully agnostic** — no project-specific code, no UI. Only generic hooks and utilities that work across any fork.
- **Components are organized by purpose** — UI primitives, Payload blocks, layout components, and feature components each have their own directory.
- **Each component is a folder** — components can be multi-file, so every component gets its own directory.
- **`scripts/` stays outside `src/`** — CLI scripts (seed, migrate, codegen) are not part of the app bundle.

## Structure

```
src/
  app/                          # Next.js App Router (pages, layouts, routes)
  core/                         # Upstream-safe, fully agnostic
    hooks/                      # Generic reusable hooks (useIsMobile, useDebounce, etc.)
    lib/                        # Generic utilities (cn, formatDate, helpers)
  components/
    ui/                         # shadcn/Base UI primitives (generated, don't hand-edit)
    blocks/                     # Payload CMS content blocks (text-media/, hero/, etc.)
    layout/                     # Structural components (navbar/, footer/, sidebar/)
    features/                   # Feature-level composed components (auth-form/, search/)
  types/                        # Project-specific TypeScript types
  providers/                    # Context providers (theme, Payload, etc.)
scripts/                        # CLI scripts — seed, migrate, codegen (outside src/)
```

## Component Hierarchy

```
UI (primitives) → Components (layout/features) → Blocks (Payload content)
```

- **ui/** — shadcn-generated primitives. Managed by shadcn CLI. Don't hand-edit.
- **layout/** — Structural page components (navbar, footer, sidebar). Each is a folder.
- **features/** — Functional composed components (auth forms, search). Each is a folder.
- **blocks/** — Payload CMS flexible content blocks. Each is a folder matching a Payload block slug.

## Path Aliases

```
@/* → src/*
```

- `@/components/ui/button` — primitives
- `@/components/blocks/hero` — Payload blocks
- `@/components/layout/navbar` — layout components
- `@/components/features/search` — feature components
- `@/core/lib/utils` — utilities
- `@/core/hooks/use-mobile` — hooks
- `@/types/...` — project types
- `@/providers/...` — context providers

## Upstream Merge Strategy

When updating the template and pulling into client forks:

- **`core/`** — safe to merge upstream. Fully agnostic, no conflicts expected.
- **`components/ui/`** — update via shadcn CLI, not git merge.
- **Everything else** — project-specific, stays in the fork.

## Config Changes Required

- `tsconfig.json` — update `@/*` to point to `src/*`
- `components.json` (shadcn) — update all alias paths to new locations
- `next.config.ts` — no changes needed (App Router auto-detects `src/app`)
