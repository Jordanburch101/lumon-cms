# Folder Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize from flat root directories into `src/` with `core/` for upstream-mergeable agnostic code.

**Architecture:** Move all app code into `src/`. Create `core/` for agnostic hooks and utilities. Organize components under `components/` with `ui/`, `blocks/`, `layout/`, and `features/` subdirectories. Update all config files and path aliases.

**Tech Stack:** Next.js 16 (auto-detects `src/app`), TypeScript path aliases, shadcn components.json

---

### Task 1: Create directory structure

**Files:**
- Create: `src/app/` (move from `app/`)
- Create: `src/core/hooks/`
- Create: `src/core/lib/`
- Create: `src/components/ui/` (move from `components/ui/`)
- Create: `src/components/blocks/` (empty, for future Payload blocks)
- Create: `src/components/layout/` (empty, for future layout components)
- Create: `src/components/features/` (empty, for future feature components)
- Create: `src/types/` (empty, for future project types)
- Create: `src/providers/` (move providers.tsx here)
- Create: `scripts/` (empty, for future CLI scripts)

**Step 1: Create the src directory tree**

```bash
mkdir -p src/core/hooks src/core/lib src/components/blocks src/components/layout src/components/features src/types src/providers scripts
```

**Step 2: Move app/ into src/app/**

```bash
mv app src/app
```

**Step 3: Move components/ui/ into src/components/ui/**

```bash
mv components/ui src/components/ui
```

**Step 4: Move composed components into src/components/**

```bash
mv components/component-example.tsx src/components/component-example.tsx
mv components/example.tsx src/components/example.tsx
```

**Step 5: Move providers.tsx into src/providers/**

```bash
mv components/providers.tsx src/providers/providers.tsx
```

**Step 6: Move lib/ and hooks/ into src/core/**

```bash
mv lib/utils.ts src/core/lib/utils.ts
mv hooks/use-mobile.ts src/core/hooks/use-mobile.ts
```

**Step 7: Remove empty old directories**

```bash
rmdir lib hooks components
```

**Step 8: Commit**

```bash
git add -A
git commit -m "refactor: move files into src/ directory structure"
```

---

### Task 2: Update tsconfig.json path alias

**Files:**
- Modify: `tsconfig.json`

**Step 1: Update the path alias to point to src/**

Change `"@/*": ["./*"]` to `"@/*": ["./src/*"]`.

Full updated `compilerOptions.paths`:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

**Step 2: Verify TypeScript resolves correctly**

```bash
bun run build
```

Expected: should fail because import paths in source files still use old aliases. That's fixed in the next tasks.

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "refactor: update tsconfig path alias to src/"
```

---

### Task 3: Update all import paths in source files

**Files:**
- Modify: `src/app/layout.tsx` — update providers import
- Modify: `src/components/component-example.tsx` — update `@/components/example` import
- Modify: `src/components/example.tsx` — check imports
- Modify: `src/providers/providers.tsx` — no changes expected (only imports from next-themes)
- Modify: `src/core/lib/utils.ts` — no changes expected
- Modify: All files in `src/components/ui/` that import from `@/lib/utils` → `@/core/lib/utils`
- Modify: All files in `src/components/ui/` that import from `@/hooks/` → `@/core/hooks/`

**Step 1: Update layout.tsx providers import**

In `src/app/layout.tsx`, change:
```typescript
import { Providers } from "@/components/providers";
```
to:
```typescript
import { Providers } from "@/providers/providers";
```

**Step 2: Bulk update `@/lib/utils` → `@/core/lib/utils` across all UI components**

```bash
find src/components/ui -name "*.tsx" -exec sed -i '' 's|@/lib/utils|@/core/lib/utils|g' {} +
```

**Step 3: Update `@/hooks/` → `@/core/hooks/` in UI components**

```bash
find src/components/ui -name "*.tsx" -exec sed -i '' 's|@/hooks/|@/core/hooks/|g' {} +
```

**Step 4: Update component-example.tsx import**

In `src/components/component-example.tsx`, the import `@/components/example` should still resolve correctly since components are now at `src/components/`. Verify no changes needed.

**Step 5: Run build to verify all imports resolve**

```bash
bun run build
```

Expected: PASS — all routes compile, static pages generate.

**Step 6: Commit**

```bash
git add -A
git commit -m "refactor: update all import paths for src/ structure"
```

---

### Task 4: Update shadcn components.json

**Files:**
- Modify: `components.json`

**Step 1: Update all alias paths and CSS path**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "radix-mira",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "gray",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "hugeicons",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/core/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/core/lib",
    "hooks": "@/core/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```

Key changes:
- `tailwind.css`: `app/globals.css` → `src/app/globals.css`
- `aliases.utils`: `@/lib/utils` → `@/core/lib/utils`
- `aliases.lib`: `@/lib` → `@/core/lib`
- `aliases.hooks`: `@/hooks` → `@/core/hooks`

**Step 2: Commit**

```bash
git add components.json
git commit -m "refactor: update shadcn config for new directory structure"
```

---

### Task 5: Update CLAUDE.md and biome config

**Files:**
- Modify: `CLAUDE.md` — update project structure section and path aliases
- Modify: `biome.jsonc` — update ignore path from `components/ui` to `src/components/ui`

**Step 1: Update biome.jsonc ignore path**

Change:
```json
"includes": ["!components/ui"]
```
to:
```json
"includes": ["!src/components/ui"]
```

**Step 2: Update CLAUDE.md project structure**

Replace the Project Structure section with:
```markdown
## Project Structure

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

Update the Conventions section path aliases:
```markdown
- Path aliases: `@/*` → `src/*`
- `@/components/ui` — shadcn primitives
- `@/components/blocks` — Payload blocks
- `@/components/layout` — structural components
- `@/components/features` — feature components
- `@/core/lib` — generic utilities
- `@/core/hooks` — generic hooks
- `@/types` — project types
- `@/providers` — context providers
```

**Step 3: Run lint check**

```bash
bun check
```

Expected: PASS

**Step 4: Run full build**

```bash
bun run build
```

Expected: PASS

**Step 5: Commit**

```bash
git add CLAUDE.md biome.jsonc
git commit -m "refactor: update CLAUDE.md and biome config for new structure"
```

---

### Task 6: Add .gitkeep files to empty directories

**Files:**
- Create: `src/components/blocks/.gitkeep`
- Create: `src/components/layout/.gitkeep`
- Create: `src/components/features/.gitkeep`
- Create: `src/types/.gitkeep`
- Create: `scripts/.gitkeep`

**Step 1: Add .gitkeep files so empty dirs are tracked**

```bash
touch src/components/blocks/.gitkeep src/components/layout/.gitkeep src/components/features/.gitkeep src/types/.gitkeep scripts/.gitkeep
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: add .gitkeep files for empty directory structure"
```
