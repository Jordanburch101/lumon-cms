# Liquid Glass Navbar — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the navbar's frosted glass with an Apple-style liquid glass effect — full SVG refraction on Chromium, enhanced CSS glass on Safari/Firefox.

**Architecture:** Two files changed. CSS utility class `.liquid-glass` in `globals.css` handles all visual layers (blur, tint, edge lighting, specular highlight, border) with a `@supports` block for Chromium SVG refraction. A displacement map generator script produces the base64 data URL. The navbar component swaps its scrolled-state classes and renders an inline SVG filter.

**Tech Stack:** CSS (backdrop-filter, box-shadow, pseudo-elements, @supports), SVG filters (feDisplacementMap, feGaussianBlur), Node.js script for displacement map generation.

---

## Tasks

### Task 1: Create the displacement map generator script

**Files:**
- Create: `scripts/generate-displacement-map.ts`

**Step 1: Write the generator script**

This script generates a base64-encoded PNG displacement map for the SVG refraction filter. It uses a convex lens surface profile and outputs a data URL string.

```ts
/**
 * Generates a base64 PNG displacement map for the liquid glass navbar filter.
 *
 * Surface: convex circle — y = sqrt(1 - (1-x)^2)
 * Encoding: R = x-displacement, G = y-displacement, 128 = neutral
 */

const width = 1920;
const height = 56;

function generateDisplacementMap(): string {
  // Each pixel: R, G, B, A
  const data = new Uint8Array(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  // Use half-height as the effective radius for the lens profile
  const maxRadius = height / 2;
  // Refraction strength — controls how far pixels shift
  const refractionIndex = 1.5;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Normalize distance from vertical center (0 at center, 1 at edge)
      const dy = (y - cy) / maxRadius;
      const dist = Math.abs(dy);

      if (dist >= 1) {
        // Outside lens — neutral displacement
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
        continue;
      }

      // Convex surface height: h = sqrt(1 - dist^2)
      const surfaceHeight = Math.sqrt(1 - dist * dist);
      // Surface normal angle from vertical
      const normalAngle = Math.atan2(dy, surfaceHeight);
      // Snell's law: sin(refracted) = sin(incident) / refractionIndex
      const sinRefracted = Math.sin(normalAngle) / refractionIndex;
      const refractedAngle = Math.asin(
        Math.max(-1, Math.min(1, sinRefracted))
      );
      // Displacement magnitude (difference between refracted and original)
      const displacement = Math.tan(refractedAngle) - Math.tan(normalAngle);
      // Normalize to 0-255 range (128 = no displacement)
      const magnitude = displacement * 127 * 0.3; // 0.3 = subtlety factor

      // X channel: no horizontal displacement for full-width bar
      data[idx] = 128;
      // Y channel: vertical displacement based on refraction
      data[idx + 1] = Math.max(0, Math.min(255, Math.round(128 + magnitude)));
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }

  // Encode as PNG using minimal PNG encoder (no dependencies)
  const png = encodePNG(width, height, data);
  const base64 = Buffer.from(png).toString("base64");
  return `data:image/png;base64,${base64}`;
}

// Minimal PNG encoder — produces valid PNG from raw RGBA data
function encodePNG(w: number, h: number, rgba: Uint8Array): Uint8Array {
  // Use Node's zlib for deflate
  const zlib = require("node:zlib");

  // PNG filter: prepend 0 (None) to each row
  const rawData = new Uint8Array(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    rawData[y * (1 + w * 4)] = 0; // filter byte
    rawData.set(
      rgba.subarray(y * w * 4, (y + 1) * w * 4),
      y * (1 + w * 4) + 1
    );
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData));

  // Build PNG file
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type: string, data: Uint8Array): Uint8Array {
    const len = new Uint8Array(4);
    new DataView(len.buffer).setUint32(0, data.length);
    const typeBytes = new TextEncoder().encode(type);
    const combined = new Uint8Array(typeBytes.length + data.length);
    combined.set(typeBytes);
    combined.set(data, typeBytes.length);
    const crc = crc32(combined);
    const crcBytes = new Uint8Array(4);
    new DataView(crcBytes.buffer).setUint32(0, crc);
    const result = new Uint8Array(4 + combined.length + 4);
    result.set(len);
    result.set(combined, 4);
    result.set(crcBytes, 4 + combined.length);
    return result;
  }

  // CRC32 lookup table
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  // IHDR chunk
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, w);
  ihdrView.setUint32(4, h);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = chunk("IHDR", ihdr);
  const idatChunk = chunk("IDAT", new Uint8Array(compressed));
  const iendChunk = chunk("IEND", new Uint8Array(0));

  const png = new Uint8Array(
    signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
  );
  let offset = 0;
  png.set(signature, offset);
  offset += signature.length;
  png.set(ihdrChunk, offset);
  offset += ihdrChunk.length;
  png.set(idatChunk, offset);
  offset += idatChunk.length;
  png.set(iendChunk, offset);

  return png;
}

// Generate and output
const dataUrl = generateDisplacementMap();
console.log(dataUrl);
```

**Step 2: Run the script and save output**

Run: `bun run scripts/generate-displacement-map.ts > /tmp/displacement-map-url.txt`

Expected: A `data:image/png;base64,...` string written to the temp file. Verify it starts with the expected prefix.

**Step 3: Commit**

```bash
git add scripts/generate-displacement-map.ts
git commit -m "feat: add displacement map generator for liquid glass filter"
```

---

### Task 2: Add the `.liquid-glass` CSS class to globals.css

**Files:**
- Modify: `src/app/globals.css:127-141` (append before end of `@layer base`)

**Step 1: Add the liquid-glass styles**

Insert the following **after** the closing `}` of `@layer base` (after line 141 in `globals.css`):

```css
/* Liquid glass navbar effect */
.liquid-glass {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 0 rgba(0, 0, 0, 0.05);
  will-change: backdrop-filter;
  transition: all 200ms;
}

.dark .liquid-glass {
  background: rgba(0, 0, 0, 0.15);
  border-bottom-color: rgba(255, 255, 255, 0.08);
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
    rgba(255, 255, 255, 0.4) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.dark .liquid-glass::after {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 50%
  );
}

/* Chromium: full SVG refraction pipeline */
@supports (backdrop-filter: url(#liquid-glass)) {
  .liquid-glass {
    backdrop-filter: url(#liquid-glass);
  }
}
```

**Step 2: Verify CSS parses**

Run: `bun build`
Expected: Build succeeds with no CSS parse errors.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add liquid-glass CSS utility class"
```

---

### Task 3: Update the navbar component

**Files:**
- Modify: `src/components/layout/navbar/navbar.tsx`

**Step 1: Add the inline SVG filter and swap scrolled-state classes**

Replace the current navbar.tsx content. Key changes:
1. Add an inline SVG with the displacement filter (using the base64 data URL from Task 1)
2. Change the scrolled class from `"border-b bg-background/80 backdrop-blur-lg"` to `"liquid-glass"`

The updated `<header>` should look like:

```tsx
<header
  className={cn(
    "sticky top-0 z-50 w-full transition-all duration-200",
    scrolled ? "liquid-glass" : "bg-transparent"
  )}
>
  {/* Inline SVG filter for Chromium refraction */}
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute h-0 w-0"
    style={{ position: "absolute" }}
  >
    <filter
      colorInterpolationFilters="sRGB"
      id="liquid-glass"
    >
      <feImage
        height="56"
        href="{PASTE_BASE64_DATA_URL_HERE}"
        result="map"
        width="1920"
        x="0"
        y="0"
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

  <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
    {/* ... existing content unchanged ... */}
  </div>
</header>
```

Replace `{PASTE_BASE64_DATA_URL_HERE}` with the actual data URL from `/tmp/displacement-map-url.txt`.

**Step 2: Verify build**

Run: `bun build`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/layout/navbar/navbar.tsx
git commit -m "feat: apply liquid glass effect to navbar"
```

---

### Task 4: Visual verification and tuning

**Step 1: Start dev server**

Run: `bun dev`

**Step 2: Verify in Chrome**

Open `http://localhost:3000` in Chrome. Scroll down the page.

Check:
- [ ] Navbar transitions from transparent to glass on scroll
- [ ] Content behind navbar appears slightly distorted (refraction)
- [ ] Subtle specular highlight visible (diagonal light gradient)
- [ ] Edge lighting visible (faint light line on top edge)
- [ ] Text remains readable

**Step 3: Verify in Safari**

Open same URL in Safari.

Check:
- [ ] Navbar transitions from transparent to glass on scroll
- [ ] Blur + saturation visible (no distortion — expected)
- [ ] Specular highlight and edge lighting still present
- [ ] Graceful fallback — looks good, just no refraction

**Step 4: Verify dark mode**

Toggle theme to dark in both browsers.

Check:
- [ ] Glass tint shifts appropriately
- [ ] Edge lighting is subtler
- [ ] Specular highlight is dimmer
- [ ] Overall effect matches light mode in structure

**Step 5: Tune displacement scale if needed**

If the refraction in Chrome is too strong or too weak, adjust `scale` attribute on the `<feDisplacementMap>` element in `navbar.tsx`:
- Too subtle: increase to 12-15
- Too strong: decrease to 6-8

If the blur is too strong/weak, adjust `stdDeviation` on `<feGaussianBlur>`:
- Less blur: 4-5
- More blur: 8-10

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: tune liquid glass visual parameters"
```

---

## Design Document

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
