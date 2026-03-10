---
name: figma-workflow
description: Project-specific Figma MCP workflows for the Lumon Payload codebase. Use whenever working with Figma — implementing designs, capturing pages to Figma, understanding tool capabilities, or mapping design tokens. Triggers on Figma URLs, mentions of "Figma", "capture to Figma", "design to code", "code to Figma", or any task involving the Figma MCP plugin. Complements the built-in Figma plugin skills with project conventions, the code-to-Figma capture workflow, and hard-won knowledge about what works and what doesn't.
---

# Figma Workflow — Lumon Payload

This skill captures everything learned about using the Figma MCP plugin effectively in this project. It complements the plugin's built-in skills (`figma:implement-design`, `figma:code-connect-components`, `figma:create-design-system-rules`) with project-specific conventions and the code-to-Figma capture workflow.

## Project Figma File

- **Design file**: `https://www.figma.com/design/WphchqX8oXptbsxPi33oE5` (Lumon Payload — Site Design)
- **Team**: Meta Design Team Go!
- **Pages**: Homepage, UI Showcase, Footer Explorations v2

When working with this project's Figma file, always use fileKey `WphchqX8oXptbsxPi33oE5`.

## Tool Inventory & When to Use Each

The Figma MCP provides these tools. Knowing which to reach for saves time:

| Tool | Purpose | When to use |
|------|---------|-------------|
| `get_design_context` | Primary design-to-code tool. Returns reference code + screenshot + metadata. | First call for any Figma → code task. Always start here. |
| `get_screenshot` | Visual screenshot of a node. | When you need a visual reference without code, or to supplement `get_design_context`. |
| `get_metadata` | XML structure map — node IDs, names, positions, sizes only. | When `get_design_context` response is too large/truncated. Get the map, then fetch specific child nodes. |
| `get_variable_defs` | Design token/variable definitions (colors, spacing, etc.) | When you need to understand the Figma file's token system and map to project tokens. |
| `generate_figma_design` | Capture a web page into Figma. | The **only** way to create designs in Figma via MCP. See "Code-to-Figma Capture" below. |
| `generate_diagram` | Create flowcharts/sequence diagrams in FigJam via Mermaid syntax. | When asked to create diagrams, NOT design files. FigJam only. |
| `get_code_connect_suggestions` | Find unmapped Figma components that could link to code. | Before setting up Code Connect mappings. |
| `send_code_connect_mappings` | Save Code Connect mappings in bulk. | After `get_code_connect_suggestions` + user confirmation. |
| `add_code_connect_map` | Map a single Figma node to a code component. | Quick single-component mapping (vs bulk). |
| `get_code_connect_map` | Check existing Code Connect mappings for a node. | To see what's already connected. |
| `create_design_system_rules` | Generate a template for design system rules. | One-time setup; already done for this project. |
| `whoami` | Check authenticated user. | Debugging permission issues. |

## What the MCP CANNOT Do

This is critical knowledge that prevents wasted time:

- **No direct editing** — Cannot modify existing Figma designs (move layers, change colors, update text)
- **No creating shapes/text** — Cannot create design elements programmatically
- **No deleting** — Cannot remove frames, pages, or components
- **No modifying variables/styles** — Cannot update Figma's design tokens directly
- **No file management** — Cannot create/delete pages, rename files

The only way to get designs INTO Figma is via the `generate_figma_design` capture workflow.

## Design-to-Code: Project Token Mapping

When translating Figma output into this project's code, always map to our token system. Figma output will use raw Tailwind/hex values that need conversion.

### Colors (oklch, in `src/app/globals.css`)

Never hardcode hex or rgb — always use semantic token classes:

- `bg-background` / `text-foreground` — base surface & text
- `bg-primary` / `text-primary-foreground` — primary actions
- `bg-secondary` / `text-secondary-foreground` — secondary surfaces
- `bg-muted` / `text-muted-foreground` — subdued elements
- `bg-accent` / `text-accent-foreground` — interactive highlights
- `bg-card` / `text-card-foreground` — card surfaces
- `bg-destructive` — error/danger states
- `border-border` / `ring-ring` / `bg-input` — form elements
- `bg-chart-1` through `bg-chart-5` — Recharts data series
- Dark mode handled automatically via `.dark` class (next-themes)

### Radius (base `--radius: 0.625rem`)

- `rounded-sm` → `calc(var(--radius) - 4px)`
- `rounded-md` → `calc(var(--radius) - 2px)`
- `rounded-lg` → `var(--radius)`
- `rounded-xl` → `calc(var(--radius) + 4px)`

### Typography

- Sans: `font-sans` (Nunito Sans) — all UI text
- Mono: `font-mono` (Geist Mono) — code, terminal, technical labels
- Do not add new font families without discussion

### Icons

- Use Hugeicons (`@hugeicons/react`) — not Lucide, not Heroicons
- Import: `import { IconName } from "@hugeicons/core-free-icons"` + `import { HugeiconsIcon } from "@hugeicons/react"`
- Render: `<HugeiconsIcon icon={IconName} />`
- Hugeicons is ESM-only — `require()` won't work

### Components

- **Primitives** (`src/components/ui/`): Generated by shadcn CLI (Base UI / radix-mira style) — never hand-edit. Always check for an existing primitive first.
- **Layout** (`src/components/layout/`): Each section gets its own folder with `{name}.tsx` + `{name}-data.ts` pattern.
- **Features** (`src/components/features/`): Composed components combining primitives.
- **Blocks** (`src/components/blocks/`): Payload CMS content blocks (future).

### Styling

- Tailwind CSS v4 via PostCSS (no `tailwind.config` file)
- Theme in `@theme inline` block in `globals.css`
- Custom effects: `.liquid-glass-*` (frosted glass), `.crt-*` (CRT monitor)
- Animations: `motion/react` (framer-motion) for scroll/entrance animations
- Respect `prefers-reduced-motion`
- Use `cn()` from `@/core/lib/utils` for conditional classes

### Assets

- Static assets in `public/` organized by feature
- Use `next/image` for images, native `<video>` with `autoPlay muted loop playsInline`
- If Figma MCP returns localhost source for images/SVGs, use directly — don't create placeholders

## Code-to-Figma: Capture Workflow

This is the only way to create designs in Figma via the MCP. The workflow builds a temporary page in the Next.js app, captures it to Figma, then cleans up.

### Step 1: Build a Temporary Page

Create a temp route (e.g., `src/app/tmp-capture/page.tsx`) containing the component(s) to capture. For design explorations:

- Make the component self-contained — minimize project imports for portability
- Include all styles inline or via Tailwind classes
- Set explicit widths/heights so the capture has clean boundaries

### Step 2: Add the Capture Script

Temporarily add the Figma capture script to `src/app/layout.tsx` in the `<head>` or `<body>`:

```html
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
```

Remove it after capture is complete.

### Step 3: Initiate Capture

Call `generate_figma_design` without `outputMode` first to get options. Then call again with:

- `outputMode: "existingFile"` + `fileKey: "WphchqX8oXptbsxPi33oE5"` to add to our project file
- `outputMode: "newFile"` to create a separate file

The tool returns a `captureId`. The dev server must be running (`bun dev`).

### Step 4: Open the Page with Capture Hash

Open the page with the capture hash URL:

```
http://localhost:3000/tmp-capture#figmacapture={captureId}&figmaendpoint={endpoint}&figmadelay=3000
```

The `figmadelay` gives the page time to render before capture.

Alternative — trigger via JS API in the browser console:

```js
window.figma.captureForDesign({
  captureId: "new-unique-id",
  endpoint: "the-endpoint-url",
  selector: "body" // or a specific CSS selector
})
```

### Step 5: Poll for Completion

Call `generate_figma_design` with `captureId` to check status. Poll every 5 seconds, up to 10 times. Status progresses: `pending` → `processing` → `completed`.

### Step 6: Clean Up

1. Remove the capture script from `layout.tsx`
2. Delete the temporary page (`src/app/tmp-capture/`)
3. Verify `layout.tsx` is restored to its clean state

### Gotchas Learned the Hard Way

- **"Capture already submitted" toast**: Each captureId is single-use. Generate a fresh one if you need to retry.
- **Stuck in "processing"**: If a capture hangs, generate a new captureId and trigger a fresh capture via the JS API rather than the hash URL.
- **Large pages**: The capture can take a long time for complex pages. Use `figmadelay=5000` or higher for heavy content.
- **Multiple designs**: For batch captures (e.g., 10 footer designs), build them all on one page and capture once, rather than multiple separate captures.

## Parallel Agent Pattern for Design Explorations

When creating multiple design variations (e.g., "10 footer designs"):

1. Spawn N agents in parallel, each writing a self-contained component file
2. Each component should be fully self-contained — no imports from the project except React/Tailwind
3. Collect all components into a single temporary page
4. Capture the page to Figma in one shot
5. Delete the temp files

This is fast and keeps the project clean.

## Workflow Decision Tree

```
User wants to...
├── Implement a Figma design → Use built-in `figma:implement-design` skill + token mapping above
├── Capture a page to Figma → Use "Code-to-Figma Capture" workflow above
├── Create design explorations → Use "Parallel Agent Pattern" + capture workflow
├── Connect components to Figma → Use built-in `figma:code-connect-components` skill
├── Set up design system rules → Already done; see CLAUDE.md or re-run `figma:create-design-system-rules`
├── Create a diagram → Use `generate_diagram` (FigJam only, Mermaid syntax)
├── Edit/delete in Figma → NOT POSSIBLE via MCP. Tell the user to do it manually.
└── Understand Figma file structure → Use `get_metadata` on page node (e.g., nodeId "0:1")
```
