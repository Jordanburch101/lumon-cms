---
name: cmux
description: >
  Control the cmux terminal multiplexer — open browser panes, take screenshots,
  run browser automation, manage workspaces/splits, send notifications, and
  update sidebar status. Use this skill whenever you need to interact with the
  cmux environment: opening browsers, taking screenshots, verifying UI visually,
  splitting panes, sending notifications, reading terminal output, or any
  workspace management. Also use when the user mentions "cmux", "split pane",
  "browser pane", "screenshot", "open browser", "notification", "sidebar status",
  or wants to visually verify something in a live browser. Prefer cmux browser
  over Playwright MCP when the user is running cmux — it shares the same visible
  browser the user sees.
---

# cmux — Terminal Multiplexer Skill

cmux is a native macOS terminal (built on Ghostty) designed for managing AI coding agents.
It provides vertical tabs, split panes, an embedded browser, notifications, and a full
socket API — all controllable from the CLI.

## When to use cmux vs Playwright

- **cmux browser**: The user sees the same browser you control. Screenshots, evals, clicks
  all happen in the visible pane. Prefer this when running inside cmux.
- **Playwright MCP**: Headless browser the user can't see. Use only when cmux is unavailable.

Detect cmux availability:
```bash
command -v cmux &>/dev/null && echo "cmux available"
```

## Core Concepts

cmux organizes content in a hierarchy:

```
Window → Workspace (sidebar entry) → Pane (split region) → Surface (tab within pane)
```

- **Workspace**: A sidebar entry (`CMUX_WORKSPACE_ID`). Create: `cmux new-workspace`
- **Pane**: A split region within a workspace. Create: `cmux new-split right|down`
- **Surface**: A tab within a pane (`CMUX_SURFACE_ID`). Each surface is a terminal or browser.

Surfaces are targeted by ref (e.g., `surface:10`) either positionally or via `--surface`:
```bash
cmux browser surface:10 screenshot --out /tmp/shot.png
cmux browser --surface surface:10 eval "document.title"
```

## Quick Reference — Most Used Commands

### Browser (visual verification workflow)

```bash
# Open a browser pane (returns surface ref)
cmux browser open http://localhost:3000

# Navigate existing browser
cmux browser surface:N navigate http://localhost:3000/about

# Take screenshot (you CAN see this image with the Read tool)
cmux browser surface:N screenshot --out /tmp/screenshot.png

# Run JavaScript
cmux browser surface:N eval "document.title"
cmux browser surface:N eval "window.scrollTo(0, 600); 'done'"

# Get accessibility snapshot (structured DOM tree)
cmux browser surface:N snapshot --interactive --compact

# Wait for page state
cmux browser surface:N wait --load-state complete --timeout-ms 15000
cmux browser surface:N wait --selector "#app" --timeout-ms 10000
cmux browser surface:N wait --text "Welcome"

# DOM interaction
cmux browser surface:N click "button[type='submit']" --snapshot-after
cmux browser surface:N fill "#email" "user@example.com"
cmux browser surface:N scroll --dy 500
cmux browser surface:N scroll-into-view "#pricing"

# Reload
cmux browser surface:N reload
```

### Workspace & Splits

```bash
# List workspaces
cmux list-workspaces

# Create splits
cmux new-split right          # terminal split
cmux new-split down           # terminal split below
cmux new-pane --type browser --direction right --url http://localhost:3000

# Read terminal output from a surface
cmux read-screen --surface surface:N
cmux read-screen --surface surface:N --scrollback --lines 100

# Send command to another terminal
cmux send --surface surface:N "bun test\n"
```

### Notifications

```bash
cmux notify --title "Build Complete" --body "No errors found"
cmux notify --title "Error" --subtitle "test suite" --body "3 tests failed"
```

### Sidebar Metadata

```bash
# Status pills (key-value, persist until cleared)
cmux set-status build "compiling" --icon hammer --color "#ff9500"
cmux set-status deploy "v1.2.3"
cmux clear-status build

# Progress bar
cmux set-progress 0.5 --label "Building..."
cmux set-progress 1.0 --label "Done"
cmux clear-progress

# Logs
cmux log "Starting build"
cmux log --level error --source build "Compilation failed"
cmux log --level success "All tests passed"
```

## Common Workflows

### Visual verification during development

```bash
# 1. Open browser alongside your terminal
SURFACE=$(cmux browser open http://localhost:3000 | grep -o 'surface:[0-9]*')

# 2. Make code changes...

# 3. Reload and screenshot
cmux browser $SURFACE reload
cmux browser $SURFACE wait --load-state complete --timeout-ms 10000
cmux browser $SURFACE screenshot --out /tmp/verify.png

# 4. Read the screenshot to verify visually
# Use the Read tool on /tmp/verify.png
```

### Scroll to element and screenshot

```bash
cmux browser surface:N eval "document.querySelector('.my-section')?.scrollIntoView({block:'center'}); 'ok'"
cmux browser surface:N screenshot --out /tmp/section.png
```

### Debug capture on failure

```bash
cmux browser surface:N console list
cmux browser surface:N errors list
cmux browser surface:N screenshot --out /tmp/failure.png
cmux browser surface:N snapshot --interactive --compact
```

### Monitor a long-running process

```bash
# Send command to a split pane and notify when done
cmux send --surface surface:N "bun build && cmux notify --title 'Build done' || cmux notify --title 'Build failed'\n"
```

## Reference Files

For the complete command reference with every flag and option, read the reference files:

- `references/browser-commands.md` — Full browser automation API
- `references/api-commands.md` — Workspace, surface, notification, sidebar API
- `references/concepts.md` — Hierarchy, env vars, detection, keyboard shortcuts
