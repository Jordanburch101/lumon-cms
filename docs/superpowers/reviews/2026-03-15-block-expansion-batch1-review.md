# Review: Block Expansion Batch 1 Design Spec

**Reviewer**: Code Review Agent
**Date**: 2026-03-15
**Spec**: `docs/superpowers/specs/2026-03-15-block-expansion-batch1-design.md`

---

## Summary

The spec is well-structured and follows a clear pattern. It covers schema definitions, component structure, registration steps, and microinteraction details. However, there are several issues ranging from critical incompatibilities with the existing codebase to ambiguities that would block implementation. Below is the full breakdown.

---

## Critical Issues (Must Fix)

### C1. Hero schema uses raw button fields instead of the `link()` field helper

The existing Hero schema (`src/payload/block-schemas/Hero.ts`) uses the project's `link()` group field helper for CTAs, which produces a rich group with internal/external link types, appearance options, and label. The spec's variant designs (centered, split, minimal) reference "buttons" and "CTA" but never address how they integrate with the existing `primaryCta` and `secondaryCta` link fields.

The **split variant** introduces a "stats panel" as an alternative to media, but the current schema has `mediaSrc` as `required: true`. Adding a variant that hides media means either:
- Removing the `required` constraint on `mediaSrc`, or
- Adding an `admin.condition` that only requires it for certain variants.

The **minimal variant** explicitly says "No media" -- same problem. The spec must address making `mediaSrc` conditionally required based on the variant value.

**Recommendation**: Add a section to the spec that explicitly states which existing fields become optional when certain variants are selected. Show the `admin.condition` approach:
```ts
{
  name: 'mediaSrc',
  type: 'upload',
  relationTo: 'media',
  admin: {
    condition: (_, siblingData) => siblingData?.variant !== 'minimal',
  },
}
```

### C2. CTA Band buttons array uses raw text fields instead of `link()` helper

The CTA Band schema defines a `buttons` array with `{ name: 'link', type: 'text' }` and `{ name: 'style', type: 'select' }`. Every other block in the project uses the `link()` group field helper for CTAs (see `Hero.ts`, `CinematicCta.ts`, `SplitMedia.ts`). The spec's approach would produce an inconsistent authoring experience and lose internal link/reference support.

**Recommendation**: Replace the raw `buttons` array with a pattern using the `link()` helper, similar to how Hero handles `primaryCta`/`secondaryCta`. Or define a simple array of link groups:
```ts
{
  name: 'buttons',
  type: 'array',
  minRows: 1,
  maxRows: 2,
  fields: [
    link({
      appearance: {
        type: ['button'],
        button: { variants: ['default', 'outline'], sizes: ['lg'] },
      },
    }),
  ],
}
```

### C3. Features Grid icon field is a `select` with "[/* curated Hugeicons names */]" placeholder

The `icon` field is left as a placeholder comment. This is a critical gap -- the implementer has no guidance on:
- Which icons to include
- How many options to provide
- Whether to use a static select (could be enormous) or a text field with runtime validation

Hugeicons has thousands of icons. A `select` field with hundreds of options degrades the admin UI experience.

**Recommendation**: Either:
1. Specify the exact curated list (10-20 icons maximum for a select), or
2. Use a `text` field where editors type a Hugeicons icon name, with a description listing available options, or
3. Build a custom Payload field component with icon search/preview (more effort, better UX).

---

## Important Issues (Should Fix)

### I1. Scope discrepancy in the overview

Line 4 says "3 hero variants + 3 new blocks" but then names 4 blocks: Features Grid, Team, CTA Band, Logo Cloud. The body of the spec covers all 4 blocks. The overview should say "3 hero variants + 4 new blocks".

### I2. Existing Hero component is NOT a `"use client"` component

The spec states all components use `"use client"` with motion/react. However, the current Hero component (`src/components/blocks/hero/hero.tsx`) is a **server component** -- it has no `"use client"` directive, no `useRef`, no `useInView`, no `motion` imports. It uses standard `<Image>`, `<video>`, and `<CMSLink>` elements with no client-side animation.

Adding variants with motion/react would require converting the Hero to a client component. This is a significant architectural change that should be explicitly acknowledged in the spec because:
- It changes the Hero from server-rendered to client-rendered
- The LCP `<link rel="preload">` pattern in the current Hero relies on React 19's server-side head hoisting -- this still works in client components but the behavior should be verified
- The existing `<CMSLink>` usage needs to be preserved across variants

**Recommendation**: Add a note acknowledging the server-to-client conversion and confirming that the preload pattern and CMSLink integration remain functional.

### I3. Export naming convention inconsistency

Existing block schemas export with a `Block` suffix: `HeroBlock`, `TrustBlock`, `CinematicCtaBlock`, `SplitMediaBlock`, etc. The spec's registration section shows:
```ts
import { FeaturesGrid } from '@/payload/block-schemas/FeaturesGrid'
import { Team } from '@/payload/block-schemas/Team'
```

These should be `FeaturesGridBlock`, `TeamBlock`, `CtaBandBlock`, `LogoCloudBlock` to match the convention.

### I4. render-blocks.tsx uses a switch statement, not an object map

The spec's registration section shows:
```tsx
featuresGrid: FeaturesGridBlock,
team: TeamBlock,
```

But the actual `render-blocks.tsx` uses a `switch/case` pattern, not an object map. The registration instructions should show `case` statements:
```tsx
case "featuresGrid":
  return <FeaturesGridBlock {...block} />;
```

### I5. Component file naming inconsistency

Existing components use descriptive filenames: `hero/hero.tsx`, `trust/trust.tsx`, `faq/faq.tsx`. The spec says new components go in `features-grid/index.tsx`, `team/index.tsx`, etc. Some existing blocks use `index.tsx` for sub-components (like `trust/flip-counter.tsx` with the main export in `trust/trust.tsx`), but the primary component file is never named `index.tsx` in existing blocks.

The render-blocks imports confirm this: `./hero/hero`, `./trust/trust`, `./faq/faq` -- not `./hero/index`.

**Recommendation**: Use the pattern `features-grid/features-grid.tsx`, `team/team.tsx`, `cta-band/cta-band.tsx`, `logo-cloud/logo-cloud.tsx`.

### I6. Team `LU-XXX` ID badge -- where does the number come from?

The spec says team cards show an `LU-XXX` overlay but doesn't specify the data source. Options:
- Auto-generated from array index (`LU-001`, `LU-002`, ...)?
- A field in the schema (not present)?
- Deterministic from the member's name (hash)?

This will produce implementation ambiguity.

**Recommendation**: Clarify in the spec. If it is decorative, state that it derives from the array index (zero-padded).

### I7. Team social `platform` field uses shorthand options syntax

The spec shows:
```ts
{ name: 'platform', type: 'select', options: ['linkedin', 'twitter', 'github', 'website'] }
```

While Payload accepts string arrays for options, every other select in the codebase uses the `{ label, value }` object syntax. For consistency and better admin labels (e.g., "LinkedIn" vs "linkedin"), use the full form.

### I8. Features Grid `label` field name collision with link field

The Features Grid items array has both a `label` field and a `link` field. The `link()` helper internally creates a `label` field inside its group. While these are at different nesting levels and won't technically collide, the field name `label` for a category tag is semantically confusing when a link label also exists. Consider renaming to `tag` or `category`.

---

## Suggestions (Nice to Have)

### S1. Magnetic hover microinteraction (Centered Hero) needs implementation guidance

"Track mouse position within radius, apply small translate via spring" is underspecified. This requires:
- A `mousemove` listener on the button or a containing element
- Distance calculation to determine if cursor is within the magnetic radius
- Spring physics for the translation

Consider referencing a specific implementation pattern or library (motion/react's `useMotionValue` + `useTransform` would be the natural choice given the stack).

### S2. Logo Cloud scroll animation -- CSS vs motion/react

The spec calls for CSS `@keyframes` for the infinite scroll but motion/react for the grid variant's stagger. This mixed approach is fine but worth noting -- the implementer should use CSS animations for the continuous scroll (they're more performant for infinite loops) and motion/react for the entrance animations.

### S3. Consider `admin.condition` for variant-dependent fields

For the Team block, the spec says `bio` is "hidden in compact variant." This should use Payload's `admin.condition`:
```ts
{
  name: 'bio',
  type: 'textarea',
  admin: {
    condition: (_, siblingData) => siblingData?.variant !== 'compact',
  },
}
```

The spec should include these conditions explicitly so implementers don't just hide them in the frontend while leaving them visible in the admin panel.

### S4. Type generation step missing

After adding new block schemas to the Pages collection, `bun run generate:types` must be run to regenerate `payload-types.ts`. The `ExtractBlock<"featuresGrid">` pattern in `block-types.ts` depends on this. The spec should include this step in the registration section.

### S5. Split hero "stats panel" needs a schema definition

The split variant says "Media side can be image, video, or a stats panel" but the Hero schema has no stats fields. Either:
- Add an optional `stats` array field to the Hero schema (similar to Trust's stats), or
- Clarify that the stats panel pulls from a different source, or
- Remove this option from the split variant scope.

This is close to Critical -- without schema fields for stats data, the stats panel cannot be implemented.

### S6. No `labels` property specified for new blocks

Every existing block schema includes a `labels` property (e.g., `labels: { singular: "Hero", plural: "Hero" }`). The spec's schema snippets omit this. The implementer should add them, but the spec should be explicit about the admin labels.

---

## What Was Done Well

- **Consistent section structure**: Every block follows the same Schema / Component / Microinteractions pattern, making the spec easy to navigate.
- **Microinteraction specificity**: Animation values are precise (durations, easing curves, pixel offsets, delay formulas). This removes guesswork for the implementer.
- **Responsive approach**: Correctly limits breakpoints to `sm:` and `lg:` per project convention.
- **File listing**: The "Files Created/Modified" section at the end provides a clear implementation checklist.
- **Variant approach for Hero**: Adding a select field to the existing block rather than creating separate blocks is the right architectural choice -- it keeps the schema count manageable and the admin experience clean.
- **Reuse of existing patterns**: The stagger and easing patterns reference existing blocks (Trust's `animate()` pattern), promoting consistency.

---

## Verdict

**Not ready for implementation as-is.** The three critical issues must be resolved first:
1. Hero `mediaSrc` must become conditionally required
2. CTA Band must use the `link()` field helper
3. Features Grid icon options must be specified

The important issues (I1-I8) should also be addressed to avoid implementation friction, but an experienced implementer could work around them with knowledge of the codebase.

After addressing the critical and important issues, this spec would be a solid implementation guide.
