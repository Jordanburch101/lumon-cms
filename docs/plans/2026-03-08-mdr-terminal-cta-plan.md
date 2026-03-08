# MDR Terminal CTA — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive Severance-inspired MDR terminal section that serves as the page-closing CTA — a CRT monitor in standby that boots up and reveals a drifting number grid when clicked.

**Architecture:** A `"use client"` component tree with a 3-state machine (`standby → booting → active`). CRT visual effects (scan lines, vignette, glow, flicker) are all CSS — no canvas. The number grid is ~200 DOM elements with randomized CSS drift animations and mouse-proximity scatter. Boot sequence uses timed `useEffect` intervals to reveal terminal text line-by-line.

**Tech Stack:** React 19, Tailwind CSS v4, motion/react (section entrance only), CSS keyframes, Geist Mono font

**Design doc:** `docs/plans/2026-03-08-mdr-terminal-cta-design.md`

**Reference images:** `~/Downloads/Screenshot 2026-03-08 at 4.21.35 PM.png` through `4.22.09 PM.png` (Lumon MDR screens from Severance)

---

### Task 1: Data file and CRT CSS foundations

**Files:**
- Create: `src/components/layout/mdr-terminal/mdr-terminal-data.ts`
- Modify: `src/app/globals.css` (append CRT keyframes + utility classes)

**Step 1: Create the data file**

All static content for the terminal — boot sequence lines, grid numbers, file metadata, bin labels.

```ts
// src/components/layout/mdr-terminal/mdr-terminal-data.ts

export type TerminalState = "standby" | "booting" | "active";

export interface BootLine {
  text: string;
  /** ms delay before this line appears (cumulative from boot start) */
  delay: number;
  /** optional suffix that appears after a pause (e.g. "OK") */
  suffix?: string;
  /** ms delay before suffix appears (relative to line appearing) */
  suffixDelay?: number;
}

export const bootSequence: BootLine[] = [
  { text: "LUMON INDUSTRIES (tm)", delay: 0 },
  { text: "MDR TERMINAL v2.0", delay: 200 },
  { text: "", delay: 600 }, // blank line pause
  {
    text: "INITIALIZING NEURAL PARTITION...",
    delay: 800,
    suffix: "OK",
    suffixDelay: 400,
  },
  {
    text: "LOADING COGNITIVE INTERFACE...",
    delay: 1500,
    suffix: "OK",
    suffixDelay: 350,
  },
  {
    text: "ESTABLISHING INNIE PROTOCOL...",
    delay: 2200,
    suffix: "OK",
    suffixDelay: 300,
  },
  { text: "", delay: 2800 }, // blank line pause
  { text: "FILE: COLD HARBOR", delay: 3000 },
  { text: "STATUS: 0% COMPLETE", delay: 3200 },
  { text: "", delay: 3600 }, // blank line pause
  { text: "BEGINNING REFINEMENT SESSION...", delay: 3800 },
];

/** Total boot duration — grid appears after this */
export const BOOT_DURATION_MS = 4400;

export const mdrFileData = {
  fileName: "Cold Harbor",
  completion: "0% Complete",
} as const;

export const mdrBins = [
  { id: "WO", label: "WO", color: "#5b8a72", fill: 0.0 },
  { id: "FC", label: "FC", color: "#c9b968", fill: 0.0 },
  { id: "DR", label: "DR", color: "#3b5998", fill: 0.0 },
  { id: "MA", label: "MA", color: "#2a4a7f", fill: 0.0 },
] as const;

/**
 * Generate a grid of random single-digit numbers.
 * Called once on mount, stable for the session.
 */
export function generateGridNumbers(
  rows: number,
  cols: number
): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 10))
  );
}

export const GRID_ROWS = 14;
export const GRID_COLS = 16;

/** CRT color constants (used in both CSS and inline styles) */
export const CRT = {
  glow: "#4a9ec5",
  glowDim: "rgba(74, 158, 197, 0.15)",
  glowBright: "rgba(74, 158, 197, 0.6)",
  bg: "#0a0e14",
  screenBg: "#060a10",
  text: "#7ab8d4",
  textDim: "rgba(122, 184, 212, 0.3)",
  textBright: "#b8e0f0",
} as const;
```

**Step 2: Add CRT CSS to globals.css**

Append these keyframes and utility classes at the end of `src/app/globals.css` (before the closing of the file, after the last rule):

```css
/* ── MDR Terminal CRT Effects ── */

@keyframes crt-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.97; }
}

@keyframes crt-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes mdr-drift {
  0% { translate: 0 0; }
  25% { translate: var(--drift-x, 2px) var(--drift-y, -1px); }
  50% { translate: var(--drift-x2, -1px) var(--drift-y2, 2px); }
  75% { translate: var(--drift-x3, 1px) var(--drift-y3, -2px); }
  100% { translate: 0 0; }
}

.crt-scanlines {
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
}

.crt-vignette {
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
}
```

**Step 3: Commit**

```bash
git add src/components/layout/mdr-terminal/mdr-terminal-data.ts src/app/globals.css
git commit -m "feat(mdr-terminal): add data file and CRT CSS foundations"
```

---

### Task 2: Boot sequence component

**Files:**
- Create: `src/components/layout/mdr-terminal/mdr-boot-sequence.tsx`

**Step 1: Build the boot sequence component**

Renders terminal text lines one-by-one with timed delays. Accepts an `onComplete` callback.

```tsx
// src/components/layout/mdr-terminal/mdr-boot-sequence.tsx
"use client";

import { useEffect, useState } from "react";
import {
  type BootLine,
  BOOT_DURATION_MS,
  CRT,
  bootSequence,
} from "./mdr-terminal-data";

interface BootSequenceProps {
  onComplete: () => void;
}

interface VisibleLine {
  line: BootLine;
  showSuffix: boolean;
}

export function MdrBootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<VisibleLine[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const line of bootSequence) {
      // Show the line
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, { line, showSuffix: false }]);
        }, line.delay)
      );

      // Show the suffix after an additional delay
      if (line.suffix && line.suffixDelay) {
        timers.push(
          setTimeout(() => {
            setVisibleLines((prev) =>
              prev.map((vl) =>
                vl.line === line ? { ...vl, showSuffix: true } : vl
              )
            );
          }, line.delay + line.suffixDelay)
        );
      }
    }

    // Signal completion
    timers.push(setTimeout(onComplete, BOOT_DURATION_MS));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col gap-0.5 p-6 font-mono text-sm lg:p-10 lg:text-base">
      {visibleLines.map((vl, i) => (
        <div key={i} style={{ color: CRT.text }}>
          {vl.line.text}
          {vl.line.suffix && (
            <span
              className="ml-4"
              style={{
                color: CRT.textBright,
                opacity: vl.showSuffix ? 1 : 0,
                transition: "opacity 0.15s",
              }}
            >
              {vl.line.suffix}
            </span>
          )}
        </div>
      ))}
      {/* Blinking cursor at the end */}
      <span
        className="mt-1 inline-block h-4 w-2"
        style={{
          backgroundColor: CRT.text,
          animation: "crt-cursor-blink 1s step-end infinite",
        }}
      />
    </div>
  );
}
```

**Step 2: Verify it renders**

This will be tested visually when integrated in Task 4. For now, confirm it builds:

Run: `bun build 2>&1 | tail -5`
Expected: No TypeScript errors for this file.

**Step 3: Commit**

```bash
git add src/components/layout/mdr-terminal/mdr-boot-sequence.tsx
git commit -m "feat(mdr-terminal): add boot sequence component"
```

---

### Task 3: Number grid component with drift and hover scatter

**Files:**
- Create: `src/components/layout/mdr-terminal/mdr-grid.tsx`

**Step 1: Build the number grid**

The grid generates ~200 numbers, animates them in row-by-row, applies randomized CSS drift, and scatters numbers near the cursor on hover.

```tsx
// src/components/layout/mdr-terminal/mdr-grid.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CRT,
  GRID_COLS,
  GRID_ROWS,
  generateGridNumbers,
  mdrBins,
  mdrFileData,
} from "./mdr-terminal-data";

/** Distance (px) within which numbers react to cursor */
const SCATTER_RADIUS = 80;

export function MdrGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Generate stable grid data once
  const grid = useMemo(() => generateGridNumbers(GRID_ROWS, GRID_COLS), []);

  // Row-by-row reveal
  const [visibleRows, setVisibleRows] = useState(0);
  useEffect(() => {
    let row = 0;
    const interval = setInterval(() => {
      row++;
      setVisibleRows(row);
      if (row >= GRID_ROWS) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Randomized drift CSS variables per cell
  const driftStyles = useMemo(() => {
    const r = (range: number) =>
      `${(Math.random() - 0.5) * range}px`;
    return Array.from({ length: GRID_ROWS * GRID_COLS }, () => ({
      "--drift-x": r(4),
      "--drift-y": r(3),
      "--drift-x2": r(4),
      "--drift-y2": r(3),
      "--drift-x3": r(4),
      "--drift-y3": r(3),
      animationDuration: `${6 + Math.random() * 8}s`,
      animationDelay: `${Math.random() * -10}s`,
    }));
  }, []);

  // Mouse proximity scatter
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const { x: mx, y: my } = mouseRef.current;
      for (let i = 0; i < cellRefs.current.length; i++) {
        const el = cellRefs.current[i];
        if (!el) continue;
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SCATTER_RADIUS) {
          const strength = 1 - dist / SCATTER_RADIUS;
          const pushX = (dx / dist) * strength * 12;
          const pushY = (dy / dist) * strength * 12;
          el.style.transform = `translate(${pushX}px, ${pushY}px)`;
          el.style.color = CRT.textBright;
          el.style.textShadow = `0 0 8px ${CRT.glowBright}`;
        } else {
          el.style.transform = "";
          el.style.color = "";
          el.style.textShadow = "";
        }
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
    for (const el of cellRefs.current) {
      if (!el) continue;
      el.style.transform = "";
      el.style.color = "";
      el.style.textShadow = "";
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2 font-mono text-xs lg:px-6 lg:text-sm"
        style={{
          borderColor: "rgba(74, 158, 197, 0.2)",
          color: CRT.text,
        }}
      >
        <span>{mdrFileData.fileName}</span>
        <span style={{ color: CRT.textDim }}>{mdrFileData.completion}</span>
        <span className="font-bold tracking-wider" style={{ color: CRT.glow }}>
          LUMON
        </span>
      </div>

      {/* Number grid */}
      <div
        className="relative flex-1 overflow-hidden p-4 lg:p-6"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={gridRef}
      >
        <div
          className="mx-auto grid gap-x-3 gap-y-1 font-mono text-sm lg:text-base"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            color: CRT.text,
          }}
        >
          {grid.map((row, ri) =>
            row.map((num, ci) => {
              const idx = ri * GRID_COLS + ci;
              return (
                <span
                  key={idx}
                  className="inline-block text-center transition-[transform,color,text-shadow] duration-200"
                  ref={(el) => { cellRefs.current[idx] = el; }}
                  style={{
                    opacity: ri < visibleRows ? 1 : 0,
                    transition: "opacity 0.3s, transform 0.2s, color 0.2s, text-shadow 0.2s",
                    animation:
                      ri < visibleRows
                        ? `mdr-drift ${driftStyles[idx].animationDuration} ease-in-out ${driftStyles[idx].animationDelay} infinite`
                        : "none",
                    textShadow: `0 0 4px ${CRT.glowDim}`,
                    ...Object.fromEntries(
                      Object.entries(driftStyles[idx]).filter(
                        ([k]) => k.startsWith("--")
                      )
                    ),
                  }}
                >
                  {num}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Bins bar */}
      <div
        className="flex items-center justify-center gap-6 border-t px-4 py-3 font-mono text-xs lg:gap-10 lg:px-6"
        style={{ borderColor: "rgba(74, 158, 197, 0.2)" }}
      >
        {mdrBins.map((bin) => (
          <div className="flex items-center gap-2" key={bin.id}>
            <span style={{ color: CRT.textDim }}>{bin.label}</span>
            <div
              className="h-2 w-16 overflow-hidden rounded-sm lg:w-20"
              style={{ backgroundColor: "rgba(74, 158, 197, 0.1)" }}
            >
              <div
                className="h-full rounded-sm"
                style={{
                  backgroundColor: bin.color,
                  width: `${bin.fill * 100}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `bun build 2>&1 | tail -5`
Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/layout/mdr-terminal/mdr-grid.tsx
git commit -m "feat(mdr-terminal): add number grid with drift and hover scatter"
```

---

### Task 4: CRT screen component (state machine shell)

**Files:**
- Create: `src/components/layout/mdr-terminal/mdr-screen.tsx`

**Step 1: Build the screen component**

Orchestrates the 3 states — renders standby, boot sequence, or active grid. Wraps content in CRT effect overlays.

```tsx
// src/components/layout/mdr-terminal/mdr-screen.tsx
"use client";

import { useCallback, useState } from "react";
import { MdrBootSequence } from "./mdr-boot-sequence";
import { MdrGrid } from "./mdr-grid";
import { type TerminalState, CRT } from "./mdr-terminal-data";

export function MdrScreen() {
  const [state, setState] = useState<TerminalState>("standby");

  const handleActivate = useCallback(() => {
    if (state !== "standby") return;
    setState("booting");
  }, [state]);

  const handleBootComplete = useCallback(() => {
    setState("active");
  }, []);

  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-xl lg:rounded-2xl"
      style={{
        backgroundColor: CRT.screenBg,
        boxShadow: `
          0 0 60px -10px ${CRT.glowDim},
          0 0 120px -20px rgba(74, 158, 197, 0.08),
          inset 0 0 80px -20px rgba(74, 158, 197, 0.05)
        `,
        animation: state !== "standby" ? "crt-flicker 4s ease-in-out infinite" : undefined,
      }}
    >
      {/* Screen content */}
      <div className="relative z-10 h-full">
        {state === "standby" && (
          <button
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 bg-transparent"
            onClick={handleActivate}
            type="button"
          >
            <span
              className="font-mono text-xs tracking-[0.3em] uppercase lg:text-sm"
              style={{ color: CRT.textDim }}
            >
              Press to initialize
            </span>
            <span
              className="inline-block h-4 w-2"
              style={{
                backgroundColor: CRT.text,
                animation: "crt-cursor-blink 1s step-end infinite",
              }}
            />
          </button>
        )}

        {state === "booting" && (
          <MdrBootSequence onComplete={handleBootComplete} />
        )}

        {state === "active" && <MdrGrid />}
      </div>

      {/* CRT overlays — always visible */}
      <div className="crt-scanlines absolute inset-0 z-20" />
      <div className="crt-vignette absolute inset-0 z-20" />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `bun build 2>&1 | tail -5`
Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add src/components/layout/mdr-terminal/mdr-screen.tsx
git commit -m "feat(mdr-terminal): add CRT screen with standby/boot/active states"
```

---

### Task 5: Main section wrapper and page integration

**Files:**
- Create: `src/components/layout/mdr-terminal/mdr-terminal.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Build the section wrapper**

Full-width dark section with entrance animation, containing the CRT screen.

```tsx
// src/components/layout/mdr-terminal/mdr-terminal.tsx
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CRT } from "./mdr-terminal-data";
import { MdrScreen } from "./mdr-screen";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MdrTerminal() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      className="w-full py-24 lg:py-32"
      data-navbar-contrast="light"
      ref={sectionRef}
      style={{ backgroundColor: CRT.bg }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 text-center lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span
            className="mb-4 block font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: CRT.textDim }}
          >
            Macro Data Refinement
          </span>
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            style={{ color: CRT.textBright }}
          >
            Experience the work
          </h2>
          <p
            className="mt-3 text-base"
            style={{ color: CRT.textDim }}
          >
            Your outie has approved this session.
          </p>
        </motion.div>

        {/* CRT Monitor */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          <MdrScreen />
        </motion.div>
      </div>
    </section>
  );
}
```

**Step 2: Add to page**

In `src/app/page.tsx`, add the import and place `<MdrTerminal />` after `<Pricing />`:

```tsx
import { MdrTerminal } from "@/components/layout/mdr-terminal/mdr-terminal";
// ... existing imports ...

export default function Page() {
  return (
    <div className="flex flex-col gap-16 lg:gap-32">
      <Hero />
      <BentoShowcase />
      <SplitMedia />
      <Testimonials />
      <ImageGallery />
      <LatestArticles />
      <CinematicCta />
      <Pricing />
      <MdrTerminal />
    </div>
  );
}
```

**Step 3: Visual verification**

Run: `bun dev`

Open `http://localhost:3000` and scroll to the bottom of the page. Verify:

1. Dark section appears after pricing
2. CRT monitor with "Press to initialize" text and blinking cursor
3. Click the monitor — boot sequence text appears line-by-line
4. After boot, number grid populates row-by-row
5. Hovering over numbers scatters them and brightens nearby ones
6. Scan lines and vignette overlays visible on the screen
7. Section header fades in on scroll

**Step 4: Run lint**

Run: `bun check`
Expected: No errors. Fix any issues.

**Step 5: Commit**

```bash
git add src/components/layout/mdr-terminal/mdr-terminal.tsx src/app/page.tsx
git commit -m "feat(mdr-terminal): add section wrapper and integrate into page"
```

---

### Task 6: Visual polish pass

**Files:**
- Modify: Any files from Tasks 1-5 as needed

This task is a visual review against the reference screenshots. Check and adjust:

**Step 1: Compare against references**

Open the 4 reference images side-by-side with the running dev server. Check:

- CRT glow color matches the blue-green from the screenshots
- Number grid density and spacing feels similar to the references
- Scan line intensity — not too strong, subtle like the real screens
- The header bar layout matches (file name left, completion center, LUMON right)
- Bin bars at bottom match the WO/FC/DR/MA layout from the bin detail reference

**Step 2: Adjust as needed**

Common tweaks likely needed:
- Grid gap / font-size tuning for density
- Glow intensity (`text-shadow` / `box-shadow` values)
- Scan line opacity
- Vignette strength
- Boot sequence timing (faster or slower)
- Drift animation speed and range

**Step 3: Test reduced motion**

Verify that with `prefers-reduced-motion: reduce`:
- Drift animations stop
- Flicker animation stops
- Boot sequence still works (text reveal is not an animation concern)
- Hover scatter still works (user-initiated, not ambient)

Add reduced motion handling if missing.

**Step 4: Test responsive**

- Mobile: monitor should fill width, text should be readable
- Tablet: comfortable sizing
- Desktop: centered with max-w-4xl, good whitespace

**Step 5: Commit**

```bash
git add -A
git commit -m "fix(mdr-terminal): visual polish pass — match reference screenshots"
```
