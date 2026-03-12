# Dynamic Island Morph Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin bar's cross-fade collapse/expand with a continuous surface morph using motion/react's `layout` animation and `layoutId`.

**Architecture:** All changes are in `admin-bar.tsx`. The collapsed pill and expanded bar become a single morphing surface — motion's `layout` prop handles dimension interpolation, `layoutId` anchors the hex icon across states, and a content wrapper provides staggered fade-in/out. No new files, no data changes.

**Tech Stack:** motion/react (`layout`, `layoutId`, `AnimatePresence`), React, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-12-dynamic-island-morph-design.md`

---

## Chunk 1: Implementation

### Task 1: Restructure AnimatePresence and strip old animations

All changes in one file. These are tightly coupled — removing `mode="wait"` without adding `layoutId` and exit positioning would break the bar, so they must be done together.

**Files:**
- Modify: `src/components/features/admin-bar/admin-bar.tsx`

- [ ] **Step 1: Define the EASE constant**

Add at the top of the file, after the imports and before `findNearestSnap`:

```tsx
const EASE = [0.16, 1, 0.3, 1] as const;
```

This is the project's standard animation ease (see theme skill). It's already used inline in `handleDragEnd` — extract it to a constant for reuse.

- [ ] **Step 2: Remove `mode="wait"` from inner AnimatePresence**

Change line 277 from:
```tsx
<AnimatePresence mode="wait">
```
to:
```tsx
<AnimatePresence>
```

- [ ] **Step 3: Strip old scale/opacity animations from collapsed button**

Remove these props from the `motion.button` (collapsed state, lines 280-288):
- `animate={{ scale: 1, opacity: 1 }}`
- `exit={{ scale: 0.8, opacity: 0 }}`
- `initial={{ scale: 0.8, opacity: 0 }}`
- `transition={{ type: "spring", stiffness: 400, damping: 30 }}`

Replace with layout transition and exit positioning:
```tsx
<motion.button
  aria-label="Expand admin bar"
  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/[0.06] bg-[#1c1c1e]/92 shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-colors hover:bg-[#2c2c2e]/92"
  exit={{ opacity: 0 }}
  key="collapsed"
  layout
  onClick={() => updateBarState({ collapsed: false })}
  style={{ position: barState.collapsed ? "relative" : "absolute" }}
  transition={{ layout: { duration: 0.4, ease: EASE } }}
  type="button"
>
```

The `style={{ position: ... }}` ensures the exiting element goes absolute so it doesn't affect the entering element's layout.

- [ ] **Step 4: Strip old scale/opacity animations from expanded bar**

Remove these props from the `motion.div` (expanded state, lines 295-306):
- `animate={{ scale: 1, opacity: 1 }}`
- `exit={{ scale: 0.9, opacity: 0 }}`
- `initial={{ scale: 0.9, opacity: 0 }}`
- `transition={{ type: "spring", stiffness: 400, damping: 30 }}`

Replace with layout transition and exit positioning:
```tsx
<motion.div
  className={cn(
    "flex items-center gap-0.5 rounded-[14px] border border-white/[0.06] bg-[#1c1c1e]/92 py-1.5 pr-1.5 pl-3.5 backdrop-blur-2xl",
    isDragging
      ? "shadow-[0_0_0_0.5px_rgba(0,0,0,0.3),0_8px_40px_rgba(0,0,0,0.2)]"
      : "shadow-[0_0_0_0.5px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]"
  )}
  exit={{ opacity: 0 }}
  key="expanded"
  layout
  style={{ position: barState.collapsed ? "absolute" : "relative" }}
  transition={{ layout: { duration: 0.4, ease: EASE } }}
>
```

- [ ] **Step 5: Wrap hex icons with layoutId**

In the **collapsed button**, replace `<LumonHexIcon size={15} />` with:
```tsx
<motion.div layoutId="admin-hex">
  <LumonHexIcon size={15} />
</motion.div>
```

In the **expanded bar's drag handle area**, replace `<LumonHexIcon />` with:
```tsx
<motion.div layoutId="admin-hex">
  <LumonHexIcon />
</motion.div>
```

The `layoutId` tells motion these are the same element in two different positions — it will automatically animate between them during the transition.

- [ ] **Step 6: Wrap expanded content in a staggered fade wrapper**

Inside the expanded `motion.div`, restructure the content so the hex icon is a direct child (sibling of the content wrapper). The content wrapper contains everything else.

Before (current structure):
```tsx
<motion.div key="expanded" ...>
  <div className="flex cursor-grab ...">  {/* drag handle */}
    <LumonHexIcon />
    <div className="flex flex-col ...">  {/* grip dots */}
    </div>
  </div>
  <AdminBarActions ... />
  <div ... />  {/* divider */}
  <AdminBarToggle ... />
  <div ... />  {/* divider */}
  <button ... />  {/* collapse */}
</motion.div>
```

After (new structure):
```tsx
<motion.div key="expanded" ...>
  {/* Hex icon — anchored via layoutId */}
  <div className="flex cursor-grab items-center pl-3.5 pr-2 active:cursor-grabbing">
    <motion.div layoutId="admin-hex">
      <LumonHexIcon />
    </motion.div>
  </div>

  {/* Content — staggered fade */}
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-0.5"
    exit={{ opacity: 0, y: 4 }}
    initial={{ opacity: 0, y: 4 }}
    transition={{ delay: 0.15, duration: 0.25, ease: EASE }}
  >
    {/* grip dots */}
    <div className="flex items-center border-white/[0.08] border-r pr-2">
      <div className="flex flex-col gap-[3px] opacity-30">
        <div className="flex gap-[3px]">
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
        </div>
        <div className="flex gap-[3px]">
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
        </div>
        <div className="flex gap-[3px]">
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
          <div className="h-[2px] w-[2px] rounded-full bg-white" />
        </div>
      </div>
    </div>

    <AdminBarActions page={page} position={barState.position} user={user} />
    <div className="mx-1 h-5 w-px bg-white/[0.08]" />
    <AdminBarToggle disabled={toggling} isDraft={isDraft} onToggle={handleToggleDraft} />
    <div className="mx-1 h-5 w-px bg-white/[0.08]" />
    <button
      aria-label="Collapse admin bar"
      className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/50"
      onClick={() => updateBarState({ collapsed: true })}
      type="button"
    >
      <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
    </button>
  </motion.div>
</motion.div>
```

Key structural changes:
- The expanded bar's `pl-3.5` padding moves to the hex icon's wrapper (so it doesn't apply to the content wrapper)
- The drag handle `cursor-grab`/`active:cursor-grabbing` stays on the hex icon wrapper
- The grip dots move into the content wrapper (they fade in/out with content)
- The `gap-0.5` moves from the expanded bar to the content wrapper
- The border-right on the drag handle stays with the grip dots (visual separator between drag area and actions)

- [ ] **Step 7: Add asymmetric expand/collapse timing**

The spec calls for 400ms expand, 300ms collapse with 100ms delay. Add the transition logic in the render section, before the return:

```tsx
const layoutTransition = barState.collapsed
  ? { duration: 0.3, ease: EASE, delay: 0.1 }
  : { duration: 0.4, ease: EASE };
```

Use this on both the collapsed and expanded elements:
```tsx
transition={{ layout: layoutTransition }}
```

- [ ] **Step 8: Update the inline EASE in handleDragEnd**

Replace the inline `const ease = [0.16, 1, 0.3, 1] as const;` in `handleDragEnd` with the file-level `EASE` constant. Change all references from `ease` to `EASE` in that function.

- [ ] **Step 9: Run lint**

```bash
bunx biome check --write src/components/features/admin-bar/admin-bar.tsx
```

Expected: no errors (biome may auto-fix formatting).

- [ ] **Step 10: Visual verification**

Open `http://localhost:3000` in the browser. Verify:

1. **Expand:** Click the collapsed pill. The surface should stretch from pill to bar, hex icon slides smoothly, content fades in after the container starts expanding.
2. **Collapse:** Click the collapse button. Content fades out first, then the bar shrinks back to the pill.
3. **Expansion direction:** Drag the bar to different snap positions and test expand/collapse at each:
   - Bottom-left: should expand rightward
   - Bottom-center: should expand outward from center
   - Bottom-right: should expand leftward
   - Same for top-* positions
4. **Rapid toggle:** Click expand then immediately collapse (and vice versa). Should smoothly reverse without jumping.
5. **Drag still works:** Drag the bar to a new position. FLIP snap animation should still work correctly.
6. **Initial render:** Refresh the page. The bar should fade in (opacity 0→1) as before, not morph.

If any of these fail, debug the `layout`/`layoutId`/`AnimatePresence` interaction. Common issues:
- Elements jumping during exit: check `style={{ position }}` logic
- No morph (just appearing): ensure `mode="wait"` is removed
- Hex icon not animating: ensure `layoutId="admin-hex"` is on `motion.div` wrappers in both states
- Content not fading: ensure the `motion.div` wrapper has `initial`, `animate`, and `exit` props

- [ ] **Step 11: Commit**

```bash
git add src/components/features/admin-bar/admin-bar.tsx
git commit -m "feat: Dynamic Island morph animation for admin bar collapse/expand"
```
