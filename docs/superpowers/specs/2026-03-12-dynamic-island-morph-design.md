# Dynamic Island Morph — Design Spec

> **For agentic workers:** This spec covers Phase 1 of the admin bar enhancement series. Implement using superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Replace the admin bar's cross-fade collapse/expand transition with a continuous surface morph inspired by Apple's Dynamic Island.

**Scope:** Animation and layout changes only. No new features, no new data fetching, no new UI elements.

---

## Animation Type

The collapsed pill (36×36) and expanded bar share one continuous surface. The container morphs between states using motion/react's `layout` animation — which automatically calculates and interpolates dimensions, position, and border-radius. The hex icon stays anchored as the visual constant connecting both states via `layoutId`.

This replaces the current `AnimatePresence mode="wait"` cross-fade where collapsed and expanded are treated as separate elements with `scale`/`opacity` enter/exit animations. Those `scale: 0.8`/`scale: 0.9` initial animations are removed entirely — the morph replaces them.

## Choreography

The choreography tables describe the **visual result** of the morph. The actual animation mechanism is motion/react's `layout` system, which handles dimension and position interpolation automatically. Only the content fade is manually controlled.

### Expand (collapsed → expanded)

Staggered in two layers:

| Layer | Visual result | Duration | Delay | Ease |
|-------|--------------|----------|-------|------|
| Container + hex icon | Pill stretches to bar dimensions, radius 10px → 14px, hex icon slides to new position | 400ms | 0ms | `[0.16, 1, 0.3, 1]` |
| Content | Fades in with subtle upward slide (opacity 0→1, y 4→0) | 250ms | 150ms | `[0.16, 1, 0.3, 1]` |

"Content" includes: drag handle grip dots, action buttons (Edit, Collections, User), dividers, draft toggle, and collapse button. All content elements share the same delay and duration — no internal stagger.

### Collapse (expanded → collapsed)

Reverse order:

| Layer | Visual result | Duration | Delay | Ease |
|-------|--------------|----------|-------|------|
| Content | Fades out with subtle downward slide (opacity 1→0, y 0→4) | 150ms | 0ms | `[0.16, 1, 0.3, 1]` |
| Container + hex icon | Bar shrinks to pill dimensions, radius 14px → 10px, hex icon slides to new position | 300ms | 100ms | `[0.16, 1, 0.3, 1]` |

Content fades out first (0–150ms), then the container shrinks (100–400ms). The slight overlap (100ms mark) prevents the animation from feeling sequential.

### Height

Both states share the same visual height (~36px). The collapsed pill is `h-9 w-9` (36×36). The expanded bar's height is determined by `py-1.5` padding and its content, which are also ~36px tall. The `layout` animation will interpolate any minor height difference automatically.

## Expansion Direction

The bar expands from the edge it's anchored to, so the morph feels grounded. This happens **naturally** through CSS positioning — no `transform-origin` classes needed:

| Snap position | CSS positioning | Natural expansion |
|--------------|----------------|-------------------|
| `*-left` | `left: 16px` | Grows rightward (left edge fixed) |
| `*-center` | `left: 50%; translate: -50%` | Grows outward from center |
| `*-right` | `right: 16px` | Grows leftward (right edge fixed) |

Motion's `layout` animation calculates FLIP transforms based on the element's bounding box. Since CSS positioning already anchors the element at the correct edge, the `layout` animation produces the correct expansion direction without additional configuration.

## Technical Approach

### Shared layoutId for hex icon

Wrap `LumonHexIcon` in a `motion.div` with `layoutId="admin-hex"` in both collapsed and expanded states. Motion automatically interpolates position and size between the two states during the transition.

```tsx
// In both collapsed and expanded renders:
<motion.div layoutId="admin-hex">
  <LumonHexIcon size={collapsed ? 15 : 14} />
</motion.div>
```

### AnimatePresence without mode="wait"

Remove `mode="wait"` from the inner `AnimatePresence`. Both states must briefly coexist in the DOM so the `layoutId` system can calculate interpolation between the outgoing and incoming hex icon positions. The `key` props ("collapsed" and "expanded") remain essential for React to distinguish the two elements, while `layoutId="admin-hex"` is what links the hex icons across them.

To prevent the exiting element from affecting layout during the overlap, apply `style={{ position: "absolute" }}` directly on both the collapsed and expanded elements' exit state. Since `position` is not animatable, it must be set immediately (not via the `exit` animation). The simplest approach: always render both states with `position: "absolute"` when not the active state, or apply it via a wrapper. The exiting element also needs its current `top`/`left` coordinates preserved (via the `style` prop or by inheriting from the parent's CSS positioning) to avoid jumping during exit.

### Container layout animation

Both the collapsed `motion.button` and expanded `motion.div` already have the `layout` prop. The existing `transition={{ type: "spring", stiffness: 400, damping: 30 }}` on these elements is **replaced** with tween-based transitions that match the choreography:

```tsx
<AnimatePresence>
  {barState.collapsed ? (
    <motion.button
      layout
      key="collapsed"
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      ...
    />
  ) : (
    <motion.div
      layout
      key="expanded"
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      ...
    />
  )}
</AnimatePresence>
```

### Asymmetric expand/collapse timing

The choreography specifies different durations for expand (400ms) vs. collapse (300ms with 100ms delay). To achieve this, the `transition` prop on the container elements should be set dynamically based on whether `barState.collapsed` just changed to `true` or `false`. One approach: track the direction in a ref and pass a different transition object:

```tsx
const isCollapsing = barState.collapsed;
const layoutTransition = isCollapsing
  ? { duration: 0.3, ease: EASE, delay: 0.1 }
  : { duration: 0.4, ease: EASE };

// On each element:
transition={{ layout: layoutTransition }}
```

The content wrapper's `exit` vs `initial`/`animate` transitions already handle the asymmetry naturally since they use separate timing values.

### Content wrapper

All content elements inside the expanded bar — everything **after** the hex icon — are wrapped in a single `motion.div` that handles the staggered fade. The boundary is: the hex icon (in its `motion.div` with `layoutId`) is a sibling of the content wrapper, both inside the expanded bar's flex container. The grip dots are inside the content wrapper (they're part of the drag handle area but visually secondary to the hex icon).

```tsx
<motion.div layout key="expanded" className="flex items-center ...">
  {/* Hex icon — persists via layoutId */}
  <motion.div layoutId="admin-hex">
    <LumonHexIcon />
  </motion.div>

  {/* Content — fades in/out with stagger */}
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 4 }}
    transition={{ delay: 0.15, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* grip dots, actions, dividers, toggle, collapse button */}
  </motion.div>
</motion.div>
```

On collapse, the content wrapper's `exit` uses faster timing: `transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}`. To differentiate exit timing from enter timing on the same element, use a dynamic transition based on the `collapsed` state, or use `onExitComplete` patterns.

### What is removed

The current implementation's enter/exit animations are **entirely replaced**:

- **Removed from collapsed button:** `initial={{ scale: 0.8, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`, `exit={{ scale: 0.8, opacity: 0 }}`
- **Removed from expanded bar:** `initial={{ scale: 0.9, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`, `exit={{ scale: 0.9, opacity: 0 }}`
- **Removed:** `AnimatePresence mode="wait"` — replaced with plain `AnimatePresence`
- **Removed:** `transition={{ type: "spring", stiffness: 400, damping: 30 }}` on both elements — replaced with tween-based `transition={{ layout: { ... } }}`

These are all replaced by `layout` animation on the container, `layoutId` on the hex icon, and the content wrapper's staggered fade.

## Files Changed

| File | Change |
|------|--------|
| `src/components/features/admin-bar/admin-bar.tsx` | Remove `mode="wait"` from AnimatePresence, remove scale/opacity enter/exit animations, add `layout` prop to collapsed/expanded elements, wrap hex icons in `motion.div` with `layoutId="admin-hex"`, wrap content in `motion.div` with staggered fade, handle exiting element layout with `position: absolute` |
| `src/components/features/admin-bar/admin-bar-data.ts` | No changes needed — CSS positioning already handles expansion direction |

No new files. No changes to `admin-bar-actions.tsx`, `admin-bar-toggle.tsx`, or `admin-bar-snap.tsx`.

## Edge Cases

- **Drag during morph:** If the user starts dragging mid-transition, motion's `layout` system handles interruption naturally — the animation recalculates from the current position.
- **Rapid toggle:** Clicking collapse then immediately expand (or vice versa) should smoothly reverse. Without `mode="wait"`, `AnimatePresence` allows both states to coexist and `layoutId` interpolates between them.
- **DOM overlap during transition:** The exiting state is positioned `absolute` so it does not affect the entering element's layout or the drag container's bounding box (`barRef`).
- **Initial render:** The bar's first appearance (opacity 0 → 1 on the outer drag container) remains unchanged. The morph only applies to subsequent collapse/expand interactions.

## What This Does NOT Include

- No new features (command palette, recent edits, etc.)
- No changes to drag-to-snap behavior
- No changes to the admin bar's data fetching or state management
- No changes to the snap zone overlay
