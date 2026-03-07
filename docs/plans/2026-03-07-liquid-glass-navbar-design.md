# Liquid Glass Navbar

## Overview

Replace the current frosted glass navbar effect (`bg-background/80 backdrop-blur-lg`) with an Apple-style liquid glass effect. Chromium browsers get the full SVG displacement refraction; Safari/Firefox gracefully degrade to an enhanced CSS-only glass.

## Current State

`navbar.tsx:19-21` — on scroll, the header applies:

```
bg-background/80 backdrop-blur-lg border-b
```

This is standard glassmorphism: a background blur with a semi-transparent fill.

## What Changes

### Visual Layers (bottom to top)

| # | Layer | Purpose | Cross-browser? |
|---|-------|---------|----------------|
| 1 | Base blur + saturation | `backdrop-filter: blur(12px) saturate(180%)` | Yes |
| 2 | SVG refraction | `feDisplacementMap` distorts content behind glass | Chromium only |
| 3 | Tinted background | Semi-transparent fill for readability | Yes |
| 4 | Edge lighting | `inset box-shadow` on top/bottom edges | Yes |
| 5 | Specular highlight | `::after` pseudo-element with diagonal gradient | Yes |
| 6 | Border | Semi-transparent border for definition | Yes |

### Chromium Detection

```css
@supports (backdrop-filter: url(#id)) {
  /* Full SVG displacement + blur pipeline */
}
```

Browsers that fail this check get layers 1, 3-6 (no distortion, but still a significantly richer glass than the current implementation).

### SVG Displacement Filter

An inline `<svg>` element (hidden, zero-size) in the navbar provides the displacement filter:

```xml
<svg width="0" height="0" style="position:absolute">
  <filter id="liquid-glass" color-interpolation-filters="sRGB">
    <feImage
      href="{base64-displacement-map}"
      x="0" y="0"
      width="{navbar-width}" height="56"
      result="map"
    />
    <feDisplacementMap
      in="SourceGraphic"
      in2="map"
      scale="10"
      xChannelSelector="R"
      yChannelSelector="G"
    />
    <feGaussianBlur stdDeviation="6" />
  </filter>
</svg>
```

The displacement map is pre-generated for the navbar height (56px / h-14), using a subtle convex lens profile. Encoded as a base64 data URL (~2-4KB). The scale of 8-12px provides visible but non-disorienting refraction.

**Displacement map generation:**
- Convex surface function: `y = sqrt(1 - (1-x)^2)`
- Cartesian conversion: `r = 128 + cos(angle) * magnitude * 127`, `g = 128 + sin(angle) * magnitude * 127`
- Red channel = X displacement, Green channel = Y displacement
- 128 = neutral (no displacement)

### CSS Glass Class

Added to `globals.css`:

```css
.liquid-glass {
  --glass-tint-light: rgba(255, 255, 255, 0.12);
  --glass-tint-dark: rgba(0, 0, 0, 0.15);
  --glass-border-light: rgba(255, 255, 255, 0.25);
  --glass-border-dark: rgba(255, 255, 255, 0.08);
  --glass-highlight-light: rgba(255, 255, 255, 0.4);
  --glass-highlight-dark: rgba(255, 255, 255, 0.15);

  position: relative;
  background: var(--glass-tint-light);
  backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--glass-border-light);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.05);
  will-change: backdrop-filter;
}

.dark .liquid-glass {
  background: var(--glass-tint-dark);
  border-bottom-color: var(--glass-border-dark);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.15);
}

/* Specular highlight */
.liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--glass-highlight-light) 0%,
    transparent 50%
  );
  pointer-events: none;
  border-radius: inherit;
}

.dark .liquid-glass::after {
  background: linear-gradient(
    135deg,
    var(--glass-highlight-dark) 0%,
    transparent 50%
  );
}

/* Chromium: full refraction pipeline */
@supports (backdrop-filter: url(#liquid-glass)) {
  .liquid-glass {
    backdrop-filter: url(#liquid-glass);
  }
}
```

### Navbar Component Changes

```tsx
// navbar.tsx — scrolled state changes from:
"border-b bg-background/80 backdrop-blur-lg"
// to:
"liquid-glass"
```

The inline SVG filter is rendered once inside the `<header>`, hidden with `width="0" height="0"`.

### Scroll Transition

Keep the existing `useScrolled()` hook. The `transition-all duration-200` on the header handles the visual transition from transparent to glass.

### Dark Mode

Same layer structure with adjusted values (see CSS above). The approach mirrors light mode — same layers, tuned opacities. Edge lighting uses dimmer white inset shadows; specular highlight is more subtle.

## Performance

- SVG filter is static (pre-baked displacement map) — no runtime computation
- No additional JS beyond the existing scroll hook
- `will-change: backdrop-filter` hints compositor optimization
- Displacement map is small (~2-4KB base64)
- `::after` pseudo-element is lightweight — no extra DOM nodes

## Browser Support

| Browser | Experience |
|---------|-----------|
| Chrome / Edge / Brave | Full liquid glass with refraction |
| Safari | Enhanced glass (blur + saturation + highlights + edge lighting) |
| Firefox | Enhanced glass (same as Safari) |

The fallback is still a clear upgrade over the current plain `backdrop-blur-lg`.

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/navbar/navbar.tsx` | Add inline SVG filter, swap glass classes |
| `src/app/globals.css` | Add `.liquid-glass` utility with all layers + `@supports` |

## Open Questions

- Exact displacement scale (8-12px range) — will need visual tuning in browser
- Whether the displacement map should tile horizontally or stretch to viewport width
- Whether to add a subtle entrance animation on the specular highlight during scroll transition

## References

- [Liquid Glass in the Browser — kube.io](https://kube.io/blog/liquid-glass-css-svg/)
- [Recreating Apple's Liquid Glass with Pure CSS — DEV](https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl)
- [CSS Liquid Glass Effects — freefrontend.com](https://freefrontend.com/css-liquid-glass/)
