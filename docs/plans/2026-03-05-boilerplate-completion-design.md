# Boilerplate Completion Design

## Context

Next.js 16 + React 19 template/showcase project. Shadcn (Base UI, radix-mira style) with 57 components already installed. Ultracite + Biome for code quality. Bun as package manager. Payload CMS will be added later.

Goal: finish core boilerplate infrastructure before building pages or features.

## Items

### 1. Wire up ThemeProvider

- Create `components/providers.tsx` with `next-themes` ThemeProvider
- Wrap app in root layout
- Add `suppressHydrationWarning` to `<html>` tag
- Config: `attribute="class"`, `defaultTheme="system"`, `enableSystem`

### 2. Update Metadata

- Set title/description to project name (e.g., "Lumon" or a generic template name)
- Remove "Create Next App" references

### 3. Create `.env.example`

- Empty template with comments for future Payload CMS vars
- Add `.env*.local` to `.gitignore` if not already there

### 4. Font cleanup

- Audit which fonts are actually used in the Tailwind theme
- Remove unused font imports or properly wire all three into the theme
- Ensure `--font-sans` and `--font-mono` map correctly

### 5. Create `CLAUDE.md`

- Document conventions: bun, Base UI/shadcn, Ultracite, Tailwind v4, hugeicons
- Path aliases, project structure
- Coding standards

### 6. Clean up default public assets

- Remove `vercel.svg`, `next.svg`, `file.svg`, `globe.svg`, `window.svg`

### 7. next.config.ts basics

- Add `reactStrictMode` if applicable for Next 16
- Keep minimal — just establish the pattern

## Out of Scope

- Payload CMS setup
- Page routes, layout shell (header/nav/footer)
- Component showcase pages
- Deployment config
