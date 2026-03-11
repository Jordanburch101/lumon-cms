# Test Structure Design

**Date:** 2026-03-12
**Status:** Approved
**Scope:** Test infrastructure for the Lumon Payload project, starting with revalidation system tests

## Overview

Establish a test structure for the project using Bun's built-in test runner. The initial implementation covers the revalidation system (hook factory + relationship walker). The structure is designed to scale as more tests are added.

## Directory Layout

```
src/
  payload/
    hooks/
      revalidateOnChange.test.ts      # Unit tests — hook factory
    lib/
      relationship-walker.ts          # Extracted from cached-payload.ts
      relationship-walker.test.ts     # Unit tests — walker logic
      cached-payload.ts               # Imports walker, unchanged API
tests/
  e2e/                                # Future — E2E against Railway staging
    revalidation.test.ts
    helpers/
      payload-client.ts               # Authenticated REST client for staging
```

**Convention:** Unit tests colocated next to source files (`*.test.ts`). E2E/integration tests in top-level `tests/` directory.

## Package Scripts

```json
{
  "test": "bun test",
  "test:watch": "bun test --watch"
}
```

No `bunfig.toml` or additional config needed. Bun discovers `*.test.ts` files automatically.

## Mocking Pattern

Bun's `mock.module()` intercepts module imports across the module graph:

```typescript
import { mock, describe, it, expect, beforeEach } from "bun:test";

const revalidatedTags: string[] = [];
mock.module("next/cache", () => ({
  revalidateTag: (tag: string, profile?: string) => {
    revalidatedTags.push(tag);
  },
  cacheTag: (...tags: string[]) => {},
  cacheLife: (profile: string) => {},
}));
```

This avoids needing test-specific exports or dependency injection. The mock must be declared before importing the module under test. Because ESM static imports are hoisted by the runtime, import the module under test via `await import(...)` inside the test body or after the `mock.module()` call at module scope — not as a top-level static import.

## Test File 1: `src/payload/hooks/revalidateOnChange.test.ts`

### What It Tests

The `revalidateOnChange()` hook factory — verifies that the returned `afterChange` and `afterDelete` hooks fire the correct `revalidateTag` calls.

### Test Cases

| Test | Input | Expected |
|------|-------|----------|
| afterChange fires doc + collection tags | `{ id: 1 }` on `pages` | `revalidateTag("doc:pages:1", "default")`, `revalidateTag("collection:pages", "default")` |
| afterDelete fires doc + collection tags | `{ id: 1 }` on `pages` | Same as above |
| Loop prevention | `context.disableRevalidate = true` | No `revalidateTag` calls |
| Custom static tags | `revalidateOnChange({ tags: ["nav"] })` | Also fires `revalidateTag("nav", "default")` |

### Mock Requirements

- `next/cache` → intercept `revalidateTag`
- Payload hook args: minimal stubs for `collection`, `doc`, `req.context`, `req.payload.logger`

## Test File 2: `src/payload/lib/relationship-walker.test.ts`

### Extraction

Extract `resolveCollection`, `walkNode`, and `tagResolvedRelationships` from `cached-payload.ts` into a new `relationship-walker.ts` module. The cached-payload module imports and calls the walker — its public API does not change.

**`relationship-walker.ts` exports:**
- `tagResolvedRelationships(doc: unknown): void` — the main entry point
- Internal helpers (`resolveCollection`, `walkNode`) remain module-private

### What It Tests

The relationship walker — verifies that `tagResolvedRelationships` calls `cacheTag` with the correct tags for various document shapes.

### Test Cases

| Test | Input | Expected `cacheTag` calls |
|------|-------|---------------------------|
| Simple relationship | `{ id: 1, relationTo: "team-members", name: "Irving" }` | `doc:team-members:1` |
| Media upload | `{ id: 5, url: "/media/photo.jpg", mimeType: "image/jpeg" }` | `doc:media:5` |
| Nested in blocks | `{ layout: [{ blockType: "hero", image: { id: 3, url: "...", mimeType: "..." } }] }` | `doc:media:3` |
| Multiple relations | Page with 3 media + 2 team members | 5 `doc:*` tags |
| Circular reference | A → B → A | No infinite loop, each tagged once |
| No false positives | `{ id: 99, title: "Page" }` (no `relationTo` or `url`+`mimeType`) | No tags |
| Array of relations | `{ members: [{ id: 1, relationTo: "users" }, { id: 2, relationTo: "users" }] }` | `doc:users:1`, `doc:users:2` |
| Deeply nested | 5 levels of nesting with relation at the bottom | Relation tagged |
| Tag count warning | Object with 101+ populated relations | `console.warn` fires |

### Mock Requirements

- `next/cache` → intercept `cacheTag` to capture tagged values
- `console.warn` → spy for tag count warning test

## E2E Structure (Future)

Not implemented now. Designed for Railway staging:

```typescript
// tests/e2e/revalidation.test.ts
// 1. Authenticate with staging Payload admin via REST API
// 2. Create or update a page
// 3. Fetch the frontend URL
// 4. Assert content reflects the change

// tests/e2e/helpers/payload-client.ts
// Authenticated REST client wrapping fetch + bearer token
// Base URL from STAGING_URL env var
```

E2E tests run locally against the staging environment (`bun test tests/e2e/`). CI integration comes later.

## Relationship Walker Extraction

The walker is currently embedded in `cached-payload.ts`. Extraction is required (not just export) because `cached-payload.ts` uses `'use cache'`, a Next.js runtime directive that cannot run in a unit test environment. Extraction steps:

1. Create `src/payload/lib/relationship-walker.ts`
   - Move: `AnyObject` type, `isObject`, `resolveCollection`, `walkNode`, `tagResolvedRelationships`
   - Export only `tagResolvedRelationships`
2. Update `cached-payload.ts`
   - Import `tagResolvedRelationships` from `./relationship-walker`
   - Remove moved code
   - No API changes

## Decisions

- **Bun test runner** — zero config, built-in, fast. No Vitest/Jest overhead.
- **`mock.module()`** — Bun-native module mocking. Avoids dependency injection or test-only exports.
- **Colocated unit tests** — follows JS/TS ecosystem convention. Tests move with their source files.
- **Separate E2E directory** — E2E tests span multiple modules and don't belong next to any single source file.
- **Extract walker** — makes the most complex logic independently testable without exposing internal helpers.
- **Local-only for now** — CI pipeline deferred until test coverage justifies gating.
