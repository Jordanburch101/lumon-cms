# Bento Grid Showcase — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the placeholder `ComponentExample` with a bento grid showcase that demonstrates the template's design system to prospective clients.

**Architecture:** CSS grid section with 5 mixed-size cards, each rendering a different UI capability (chart, image card, KPI stats, form, theme preview). Static data file drives content. Server components except the chart card (Recharts requires client).

**Tech Stack:** Next.js App Router, Tailwind CSS v4, Recharts + shadcn ChartContainer, shadcn Card/Badge/Input/Button, Hugeicons

---

## File Structure

```
src/components/layout/bento/
  bento.tsx           -- main section component with grid + headline
  bento-data.ts       -- static data for all cards (chart data, stats, copy)
  chart-card.tsx      -- "use client" Recharts area chart with stat headline
  image-card.tsx      -- card with cover image, title, description, badge
  stats-card.tsx      -- 3 KPI counters with trend indicators
  form-card.tsx       -- compact form with inputs + button
  theme-card.tsx      -- light/dark theme side-by-side preview
```

---

### Task 1: Create bento-data.ts

**Files:**
- Create: `src/components/layout/bento/bento-data.ts`

**Step 1: Create the data file**

```ts
export const bentoSectionData = {
  headline: "Everything you need, ready to ship",
  subtext:
    "A complete design system with production-grade components. Charts, forms, theming, and more — all wired up and ready to go.",
} as const;

export const chartData = [
  { month: "Jan", visitors: 2100 },
  { month: "Feb", visitors: 2400 },
  { month: "Mar", visitors: 1800 },
  { month: "Apr", visitors: 3200 },
  { month: "May", visitors: 2900 },
  { month: "Jun", visitors: 3800 },
] as const;

export const statsData = [
  { label: "Revenue", value: "$48.2k", change: "+12.5%", trend: "up" as const },
  { label: "Users", value: "2,847", change: "+8.1%", trend: "up" as const },
  { label: "Uptime", value: "99.98%", change: "+0.02%", trend: "up" as const },
] as const;

export const imageCardData = {
  src: "https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=800&auto=format&fit=crop",
  alt: "Abstract colorful gradient",
  title: "Observability Plus",
  description: "Track, measure, and visualize your data in real time with built-in analytics.",
  badge: "New",
} as const;
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/bento-data.ts
git commit -m "feat(bento): add static data for bento showcase cards"
```

---

### Task 2: Create chart-card.tsx

**Files:**
- Create: `src/components/layout/bento/chart-card.tsx`

**Dependencies:** `src/components/ui/chart.tsx`, `src/components/ui/card.tsx`, `recharts`

**Step 1: Create the chart card component**

This is a `"use client"` component because Recharts requires client-side rendering. Uses the shadcn `ChartContainer` wrapper with an `AreaChart`. Shows a stat headline ("+24% this month") above the chart inside a Card.

```tsx
"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { chartData } from "./bento-data";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export function ChartCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Monthly Visitors</CardDescription>
        <CardTitle className="text-2xl">+24%</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-40 w-full" config={chartConfig}>
          <AreaChart data={[...chartData]}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillVisitors" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-visitors)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-visitors)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              dataKey="visitors"
              fill="url(#fillVisitors)"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/chart-card.tsx
git commit -m "feat(bento): add chart analytics card with Recharts area chart"
```

---

### Task 3: Create image-card.tsx

**Files:**
- Create: `src/components/layout/bento/image-card.tsx`

**Step 1: Create the image card component**

Server component. Uses Card with cover image, primary-tinted overlay (matching existing card example pattern), title, description, and badge.

```tsx
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { imageCardData } from "./bento-data";

export function ImageCard() {
  return (
    <Card className="h-full pt-0">
      <div className="relative">
        <div className="absolute inset-0 z-10 bg-primary opacity-50 mix-blend-color" />
        <Image
          alt={imageCardData.alt}
          className="aspect-[4/3] w-full object-cover brightness-60 grayscale"
          height={300}
          src={imageCardData.src}
          width={400}
        />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {imageCardData.title}
          <Badge variant="secondary">{imageCardData.badge}</Badge>
        </CardTitle>
        <CardDescription>{imageCardData.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/image-card.tsx
git commit -m "feat(bento): add image card with cover photo and badge"
```

---

### Task 4: Create stats-card.tsx

**Files:**
- Create: `src/components/layout/bento/stats-card.tsx`

**Step 1: Create the stats card component**

Server component. Renders 3 KPI counters in a row inside a Card, each with label, value, and a green change indicator.

```tsx
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { statsData } from "./bento-data";

export function StatsCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-center">
        <div className="grid w-full grid-cols-3 divide-x">
          {statsData.map((stat) => (
            <div className="flex flex-col items-center gap-1 px-3" key={stat.label}>
              <span className="text-muted-foreground text-xs">{stat.label}</span>
              <span className="font-semibold text-xl tabular-nums">{stat.value}</span>
              <span className="flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon className="size-3" icon={ArrowUp01Icon} strokeWidth={2} />
                {stat.change}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/stats-card.tsx
git commit -m "feat(bento): add KPI stats card with trend indicators"
```

---

### Task 5: Create form-card.tsx

**Files:**
- Create: `src/components/layout/bento/form-card.tsx`

**Step 1: Create the form card component**

Server component. Compact form with name input, email input, and submit button inside a Card.

```tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FormCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
        <CardDescription>We'll get back to you shortly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bento-name">Name</FieldLabel>
              <Input id="bento-name" placeholder="Your name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="bento-email">Email</FieldLabel>
              <Input id="bento-email" placeholder="you@example.com" type="email" />
            </Field>
            <Button className="w-full" type="button">
              Submit
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/form-card.tsx
git commit -m "feat(bento): add compact contact form card"
```

---

### Task 6: Create theme-card.tsx

**Files:**
- Create: `src/components/layout/bento/theme-card.tsx`

**Step 1: Create the theme preview card**

Server component. Shows a side-by-side light/dark preview using forced color schemes on two mini UI snippets.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MiniPreview({ mode }: { mode: "light" | "dark" }) {
  const isLight = mode === "light";
  return (
    <div
      className={`flex-1 rounded-md p-3 ${
        isLight
          ? "bg-white text-zinc-900 ring-1 ring-zinc-200"
          : "bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700"
      }`}
    >
      <div
        className={`mb-2 h-1.5 w-8 rounded-full ${isLight ? "bg-zinc-900" : "bg-zinc-100"}`}
      />
      <div
        className={`mb-1 h-1 w-full rounded-full ${isLight ? "bg-zinc-200" : "bg-zinc-700"}`}
      />
      <div
        className={`h-1 w-3/4 rounded-full ${isLight ? "bg-zinc-200" : "bg-zinc-700"}`}
      />
    </div>
  );
}

export function ThemeCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Theming</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <MiniPreview mode="light" />
          <MiniPreview mode="dark" />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/layout/bento/theme-card.tsx
git commit -m "feat(bento): add light/dark theme preview card"
```

---

### Task 7: Create bento.tsx (main section) and wire into page

**Files:**
- Create: `src/components/layout/bento/bento.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create the main bento section component**

Renders headline + subtext, then the CSS grid with all 5 cards placed in their bento positions.

Grid layout (4 cols on desktop):
```
[ Chart (2x2)     ] [ Image (1x2) ]
[                  ] [             ]
[ Stats (2x1)     ] [ Form  (1x1) ] [ Theme (1x1) ]
```

```tsx
import { bentoSectionData } from "./bento-data";
import { ChartCard } from "./chart-card";
import { FormCard } from "./form-card";
import { ImageCard } from "./image-card";
import { StatsCard } from "./stats-card";
import { ThemeCard } from "./theme-card";

export function BentoShowcase() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-semibold text-3xl leading-tight sm:text-4xl">
            {bentoSectionData.headline}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {bentoSectionData.subtext}
          </p>
        </div>
        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Chart: 2 cols, 2 rows */}
          <div className="sm:col-span-2 sm:row-span-2">
            <ChartCard />
          </div>
          {/* Image: 1 col, 2 rows */}
          <div className="sm:row-span-2 lg:col-span-1">
            <ImageCard />
          </div>
          {/* Theme: 1x1 */}
          <div className="lg:col-span-1">
            <ThemeCard />
          </div>
          {/* Stats: 2 cols, 1 row */}
          <div className="sm:col-span-2">
            <StatsCard />
          </div>
          {/* Form: 1x1 — only visible on lg where we have 4 cols */}
          <div className="lg:col-span-1">
            <FormCard />
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Update page.tsx to use BentoShowcase instead of ComponentExample**

Replace the import and usage:

```tsx
import { Hero } from "@/components/layout/hero/hero";
import { BentoShowcase } from "@/components/layout/bento/bento";

export default function Page() {
  return (
    <>
      <Hero />
      <BentoShowcase />
    </>
  );
}
```

**Step 3: Run `bun check` to verify no lint errors**

```bash
bun check
```

**Step 4: Run `bun dev` and visually verify the section renders**

**Step 5: Commit**

```bash
git add src/components/layout/bento/bento.tsx src/app/page.tsx
git commit -m "feat(bento): add bento showcase section and wire into home page"
```

---

### Task 8: Visual QA and polish

**Step 1: Run the dev server and check:**
- Desktop (4-col grid, all cards visible and properly sized)
- Tablet (2-col grid, cards stack nicely)
- Mobile (1-col stack)
- Dark mode toggle works, chart colors adapt
- Image card overlay tint matches existing card example style

**Step 2: Fix any spacing, overflow, or sizing issues discovered**

**Step 3: Run `bun check` one final time**

**Step 4: Commit any polish fixes**

```bash
git add -A
git commit -m "fix(bento): visual polish and responsive adjustments"
```
