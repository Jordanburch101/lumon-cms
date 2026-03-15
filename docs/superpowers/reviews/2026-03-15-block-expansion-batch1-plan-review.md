# Plan Review: Block Expansion Batch 1

**Reviewer:** Code Review Agent
**Date:** 2026-03-15
**Verdict:** Approve with required fixes (3 Critical, 4 Important, 5 Suggestions)

---

## What Was Done Well

- Thorough task decomposition with lint/test/commit checkpoints at every step
- Correct use of `ExtractBlock<>` pattern, `link()` helper, `data-field`/`data-array-item` attributes
- Server/client boundary handled correctly: `hero.tsx` stays server, variants are `"use client"`
- Consistent motion skeleton (`EASE`, `useInView`, `margin: "-100px"`, `once: true`) across all blocks
- CSS-based infinite scroll for Logo Cloud avoids layout thrashing
- Schema conditional visibility with `admin.condition` + custom `validate` for Hero mediaSrc

---

## Critical Issues (Must Fix)

### C1. Hero Split imports `FlipCounter` from Trust -- wrong component type

**Plan line 484:** `import { FlipCounter } from "../trust/flip-counter";`

`FlipCounter` is typed against `TrustBlock["stats"][number]` which has `value: number`, `format`, `decimals`, and `suffix` fields. The Hero `stats` array has `value: text` and `label: text` only. This import will produce a TypeScript error and the counter won't render correctly because it expects numeric stat values, not arbitrary text strings.

**Fix:** Either (a) render stat values as plain text in Hero Split (no FlipCounter), or (b) redesign the Hero stats schema to match TrustBlock's stats shape. Option (a) is simpler and aligns with the spec which says "stat countup" but the schema uses `type: 'text'` -- these are incompatible. The spec says to use Trust's `animate()` pattern but the schema stores text, not numbers.

### C2. Hero Centered renders an empty eyebrow `<p>` tag

**Plan line 388:** The centered hero renders an empty `<motion.p>` with a comment `{/* eyebrow is not in schema */}`. The Hero schema has no `eyebrow` field, so this element will always render as an empty paragraph in the DOM, wasting space and potentially causing layout issues.

**Fix:** Remove the empty eyebrow `<motion.p>` entirely, or add an `eyebrow` field to the Hero schema if it's needed.

### C3. Hero Split renders an empty `<motion.p>` for eyebrow

**Plan line 534-538:** Similar to C2, the Split variant renders `<motion.p ... />` (self-closing, no children). This is an empty animated paragraph with no content. The Hero schema has no eyebrow field.

**Fix:** Remove this empty element.

---

## Important Issues (Should Fix)

### I1. `whileTap` on CTA wrapper div in CTA Band applies scale to BOTH buttons

**Plan line 1681:** `whileTap={{ scale: 0.97 }}` is on the `<motion.div>` wrapping both CTA buttons. The spec says "Button scale press" -- this should be on individual buttons, not the container. Pressing one button will visually squish both.

**Fix:** Move `whileTap` to individual `<CMSLink>` wrappers or wrap each in a `<motion.div whileTap>`.

### I2. Features Grid icon map uses speculative Hugeicons import names

**Plan lines 925-937:** Icon imports like `Layers01Icon`, `ShieldCheckIcon`, `FlashIcon`, etc. are guessed. The plan itself acknowledges this: "Hugeicons icon import names may differ." Incorrect import names will cause build failures.

**Fix:** Add a verification step: "Run `bun check` after creating `icon-map.tsx` to verify all icon imports resolve." The plan does have a lint step later but it's separated by the component creation task. Better to verify immediately.

### I3. Team component doesn't render social `links` array

The spec (line 240-253) defines a `links` array with `platform` and `url` fields. The plan's Team component (lines 1242-1441) never renders `member.links`. It renders bio and department in detailed mode but completely omits social links.

**Fix:** Add social link rendering in the detailed variant section, after bio.

### I4. Logo Cloud scroll variant renders both image AND name text simultaneously

**Plan lines 1896-1913:** Each scroll item renders the logo image AND `logo.name` as visible text. The spec says logos are rendered as `next/image` with brightness/invert filter. Showing both the image and a text name for every item in a marquee is unusual and cluttered.

**Fix:** Show only the image when `logoUrl` exists, fall back to text-only name when no image. Or confirm this is intentional.

---

## Suggestions (Nice to Have)

### S1. Missing spec microinteraction: Features Grid "card border trace"

The spec describes "On hover, a 1px highlight traces the card border -- animated background-position on a linear-gradient border." The plan's component uses simple `hover:bg-card/80` which is just a background color shift. The border trace animation is omitted.

### S2. Missing spec microinteraction: Features Grid "icon float"

The spec describes "Icons have slow y: -2px to 2px breathing animation (CSS @keyframes, 3s infinite)." The plan doesn't implement this.

### S3. Missing spec microinteraction: Team "ID typewriter"

The spec says "Badge text types in character-by-character (0.05s per char) after photo reveals." The plan implements a simple opacity fade-in instead.

### S4. Template string concatenation instead of `cn()` in CTA Band

**Plan line 1580:** Uses `className={\`relative overflow-hidden ${isPrimary ? ... : ...}\`}` template string. The project convention is to use `cn()` from `@/core/lib/utils` for conditional class merging.

### S5. Consider extracting shared media rendering logic

The video/image rendering block is duplicated across `HeroDefault`, `HeroCentered`, `HeroSplit`. A shared `<HeroMedia>` component would reduce duplication.

---

## Spec Coverage Checklist

| Spec Item | Plan Covered? | Notes |
|-----------|:---:|-------|
| Hero variant select field | Yes | |
| Hero mediaSrc conditional required | Yes | |
| Hero posterSrc conditional | Yes | |
| Hero stats array (split only) | Yes | |
| Hero Centered: word stagger | Yes | |
| Hero Centered: grid overlay pulse | Yes | |
| Hero Centered: CTA magnetic hover | Yes | |
| Hero Split: 2-column grid | Yes | |
| Hero Split: stat countup | Partial | Uses FlipCounter but schema type mismatch (C1) |
| Hero Split: panel hover tilt | Yes | |
| Hero Split: "Live Metrics" badge pulse | Yes | |
| Hero Minimal: gradient reveal | Yes | |
| Hero Minimal: divider draw | Yes | |
| Features Grid: 1px-gap grid | Yes | |
| Features Grid: icon rendering | Yes | With caveat on icon names (I2) |
| Features Grid: card border trace | No | S1 |
| Features Grid: icon float | No | S2 |
| Features Grid: stagger on scroll | Yes | |
| Team: grid layout | Yes | |
| Team: photo clip-reveal | Yes | |
| Team: ID badge typewriter | No | Opacity fade instead (S3) |
| Team: card lift on hover | Yes | CSS translate instead of motion whileHover |
| Team: department tag fade | Yes | |
| Team: social links rendering | No | I3 |
| CTA Band: primary shimmer | Yes | |
| CTA Band: button scale press | Partial | Applied to container not individual buttons (I1) |
| CTA Band: card border glow | Yes | |
| CTA Band: eyebrow tracking | Yes | |
| Logo Cloud: infinite CSS scroll | Yes | |
| Logo Cloud: pause on hover | Yes | |
| Logo Cloud: grid stagger pop | Yes | |
| Logo Cloud: grid hover highlight | Partial | CSS transition, no sibling dimming logic |

---

## Registration Completeness

| Registration Point | Plan Covered? |
|---|:---:|
| Schema imports in `Pages.ts` | Yes (Tasks 7, 10, 12, 14) |
| Schema added to `layout.blocks` | Yes |
| Component imports in `render-blocks.tsx` | Yes (Tasks 9, 11, 13, 15) |
| switch/case entries | Yes |
| Type exports in `block-types.ts` | Yes (Tasks 7, 10, 12, 14) |
| `generate:types` after schema changes | Yes |
| icon-map.tsx for Features Grid | Yes (Task 8) |
| logo-cloud.css for Logo Cloud | Yes (Task 15) |

All registration steps are accounted for. No missing imports or wiring.

---

## Summary

The plan is comprehensive and well-structured. The three critical issues (C1-C3) will cause runtime errors or render empty DOM elements and must be fixed before implementation begins. The four important issues (I1-I4) affect correctness and spec fidelity. The five suggestions are polish items that can be addressed in a follow-up pass.
