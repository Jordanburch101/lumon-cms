# MDR Terminal CTA — Design Document

## Overview

An interactive, full-width section placed after the Pricing section as the page closer. Features a CRT monitor in standby mode that boots into a Macro Data Refinement (MDR) terminal experience when clicked — inspired by the Lumon computer interfaces from Severance.

The CTA *is* the experience: clicking powers on the monitor.

## Visual Aesthetic

- **Full-width immersive**: dark background bleeds edge-to-edge, dramatic section break before footer
- **CRT screen**: rounded-rect with scan lines overlay, subtle screen curvature via CSS vignette, phosphor glow (box-shadow with signature blue-green)
- **On-screen typography**: Geist Mono, bloomed/glowing text mimicking CRT phosphor bleed
- **Color palette**: cold blue-green from the Severance CRT screens, brighter highlights for active numbers
- **Scan lines**: repeating 2px transparent/dark-transparent gradient overlay
- **Screen flicker**: subtle CSS animation with slight opacity oscillation (0.97-1.0)

### Reference images (in ~/Downloads/)

- `Screenshot 2026-03-08 at 4.21.35 PM.png` — Cold Harbor file, full grid, 0% complete
- `Screenshot 2026-03-08 at 4.21.41 PM.png` — Siena file, numbers clustering
- `Screenshot 2026-03-08 at 4.22.02 PM.png` — Bin detail view (WO, FC, DR, MA progress bars)
- `Screenshot 2026-03-08 at 4.22.09 PM.png` — Cold Harbor, brighter glow variant

## State Machine

```
"standby" → click → "booting" → auto → "active"
```

### Standby

- Monitor visible with faint blue-green glow
- Blinking cursor on screen
- Subtle prompt to interact (e.g. blinking underscore or faint "PRESS TO INITIALIZE")

### Booting (authentic retro terminal boot, ~3s)

Sequential text lines with timed delays:

```
LUMON INDUSTRIES (tm)
MDR TERMINAL v2.0

INITIALIZING NEURAL PARTITION...    OK
LOADING COGNITIVE INTERFACE...      OK
ESTABLISHING INNIE PROTOCOL...      OK

FILE: COLD HARBOR
STATUS: 0% COMPLETE

BEGINNING REFINEMENT SESSION...
```

Each line appears with a typing/reveal effect. After the last line, the grid fades in.

### Active

- Number grid populates (row-by-row fill for dramatic effect)
- Numbers slowly drift with randomized CSS animations
- Header bar: file name + "0% Complete" + Lumon logo
- 4 bins at bottom (WO, FC, DR, MA) with static progress bars
- Hover over number clusters: they glow brighter and scatter outward from cursor

## Technical Architecture

### Component structure

```
src/components/layout/mdr-terminal/
  mdr-terminal.tsx        — main section wrapper + CRT frame
  mdr-terminal-data.ts    — file names, grid numbers, boot text lines
  mdr-screen.tsx          — the CRT screen (standby / boot / active states)
  mdr-grid.tsx            — the number grid with drift/hover interactions
  mdr-boot-sequence.tsx   — the terminal boot text animation
```

### Implementation approach

- **All CSS, no canvas**: scan lines, glow, vignette, flicker are CSS overlays
- **State management**: simple `useState` for the 3-state machine
- **Boot sequence**: `setTimeout` chain or `useEffect` intervals for timed text reveal
- **Number grid**: ~200 numbers in a CSS grid, each with randomized slow drift animation (CSS `translate` keyframes with different durations/delays)
- **Hover scatter**: `onMouseMove` on a transparent overlay, updates CSS custom properties on nearby number elements. Throttle with `requestAnimationFrame` if needed.
- **Motion library**: only for section entrance animation (consistent with rest of site)
- **CRT effects**:
  - Scan lines: `repeating-linear-gradient` overlay, `pointer-events-none`
  - Vignette/curvature: radial gradient darkening at edges
  - Phosphor glow: `text-shadow` + `box-shadow` with blue-green color
  - Flicker: CSS `@keyframes` with subtle opacity changes

### Performance considerations

- ~200 DOM elements for the grid — well within browser limits
- CSS animations offloaded to compositor (transforms + opacity)
- Hover distance checks: if choppy, throttle via `requestAnimationFrame` or check spatial subset only
- Boot sequence uses simple timers, no heavy dependencies

## Page Integration

```tsx
// src/app/page.tsx — add after <Pricing />
<Pricing />
<MdrTerminal />
```

Section uses `data-navbar-contrast="light"` for light navbar text against the dark background.
