---
name: design-language
description: Maintain visual consistency when building new components by analyzing and replicating the existing codebase's design patterns. Use this skill whenever creating a new UI section, component, or page — especially when the user says "make it match", "keep it consistent", "follow the existing style", or simply asks to build a new component in a project with established patterns. Also use when reviewing components for visual consistency, or when a component "doesn't feel like it fits in" with the rest of the site.
---

# Design Language — Pattern Replication System

When building new components in an existing codebase, the biggest risk isn't bad code — it's visual inconsistency. A component that uses different spacing, animation timing, font weights, or structural patterns will feel "off" even if the code is technically correct. This skill teaches you how to read a codebase's visual DNA and replicate it faithfully.

## When This Skill Fires

You're about to create or modify a UI component in a project that already has established components. Before writing any markup or styles, you need to understand what "consistent" means for THIS codebase.

## The Process

### Step 1: Audit the Existing Components

Before writing a single line, read 3-5 existing components that are structurally similar to what you're building. Look for the **theme skill** first — if the project has one (check `.agents/skills/theme/` or similar), it contains the extracted patterns and you can skip to Step 3.

If no theme skill exists, extract these patterns yourself:

**Animation DNA:**
- What easing curve do they share? (look for a shared constant like `EASE`)
- What library handles motion? (CSS, motion/react, GSAP, etc.)
- How is scroll-triggering configured? (`useInView` options, `IntersectionObserver` settings)
- What's the stagger formula for lists/grids? (delay increment per item)
- What are the `initial` and `animate` values? (y-offset, opacity)
- What durations are used for different element types?

**Typography DNA:**
- What Tailwind classes / CSS values do section headings use?
- What about subtitles, body text, labels, eyebrows?
- Which font weights appear and where?
- Are there letter-spacing patterns for specific text types (e.g., uppercase labels)?
- What line-height values pair with which font sizes?

**Spacing DNA:**
- What's the container pattern? (max-width, horizontal padding, centering)
- What vertical padding do sections use?
- What's the gap between a heading and its content?
- What grid gaps are used and at what breakpoints?
- How much space sits between major sections?

**Color DNA:**
- What color system is in use? (CSS variables, Tailwind tokens, raw values)
- Which semantic tokens appear most often?
- How is text color handled for primary vs secondary vs muted content?
- How do dark/light mode tokens work?

**Structure DNA:**
- How are data files organized? (naming, exports, types)
- What's the component file template? (imports, constants, hooks, render order)
- How is responsive behavior handled? (which breakpoints, mobile-first vs desktop-first)
- What grid configurations recur?

**Interaction DNA:**
- What hover states exist? (transforms, shadows, color changes)
- What transition durations are standard?
- Are there shared patterns for focus/active states?

### Step 2: Write Down What You Found

Don't trust your memory — write the extracted patterns into a concise checklist before you start building. For each category above, note the EXACT values:

```
Animation: EASE = [0.16, 1, 0.3, 1], useInView { once: true, margin: "-100px" }
Headings: font-semibold text-3xl leading-tight sm:text-4xl
Container: mx-auto max-w-7xl px-4 lg:px-6
Stagger: delay: 0.1 + i * 0.05
...
```

### Step 3: Build the New Component

Now write the component, matching EVERY pattern from Step 2. The most common consistency failures:

1. **Wrong font weight** — Using `font-bold` when the codebase uses `font-semibold` for headings. Feels heavier than everything else.
2. **Wrong animation timing** — Custom easing or duration that doesn't match. Elements feel like they belong to a different site.
3. **Wrong spacing scale** — Using `mt-6` when the pattern is `mt-3` for heading-to-content gaps. Throws off vertical rhythm.
4. **Wrong breakpoints** — Adding `md:` breakpoints when the codebase only uses `sm:` and `lg:`. Creates inconsistent reflow points.
5. **Wrong color tokens** — Using `text-gray-500` when the codebase uses `text-muted-foreground`. Breaks dark mode or theme switching.
6. **Wrong container** — Different max-width or padding than other sections. Content doesn't align.

### Step 4: Cross-Check

After building, visually compare your component against an existing one. For each pattern category, verify the values match. If something feels "off" but you can't pinpoint it, check:

- Does the y-offset in `initial` match other components?
- Does the stagger delay formula match?
- Are you using the same responsive grid pattern?
- Is the eyebrow/label text identical in weight, size, spacing, and case?

## Working With Theme Skills

If the project has a **theme skill** (e.g., `theme/SKILL.md`), that file IS the extracted pattern reference. Use it directly instead of auditing components yourself. The theme skill provides the "what" (exact values), this skill provides the "how" (the replication methodology).

The separation:
- **Design Language** (this skill) = the process of maintaining consistency
- **Theme** = the specific values for a particular project

## Anti-Patterns

**"I'll make it my own"** — No. The goal is seamless integration, not personal expression. Save creativity for the layout and content, not the foundational patterns.

**"Close enough"** — A `0.7s` duration when the codebase uses `0.8s` IS noticeable. A `font-bold` when everything else is `font-semibold` IS noticeable. Match exactly.

**"I'll improve the pattern"** — If you think an existing pattern should change (e.g., better easing), propose it as a separate refactor across ALL components. Don't create a one-off improvement in a single component.

**"The design calls for something different"** — Designs sometimes specify values that don't match the implemented system. When this happens, flag it — don't silently deviate. The codebase is the source of truth for consistency; the design is the source of truth for intent. Reconcile them explicitly.
