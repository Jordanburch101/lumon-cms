"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Determines whether the navbar text should be light or dark based on
 * the background luminance of elements behind the navbar.
 *
 * Hides the header, samples elements at several horizontal points,
 * walks up the DOM to find the first opaque background or media element.
 */
export function useNavbarContrast(
  headerRef: React.RefObject<HTMLElement | null>
) {
  const [contrast, setContrast] = useState<"light" | "dark">("dark");
  const rafRef = useRef<number>(0);

  const sample = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const rect = header.getBoundingClientRect();
    if (rect.height === 0) return;

    const sampleX = [0.15, 0.35, 0.5, 0.65, 0.85];
    const y = rect.height / 2;

    let totalLuminance = 0;
    let sampleCount = 0;

    for (const xRatio of sampleX) {
      const x = rect.width * xRatio;
      // elementsFromPoint returns all elements at the point, stacked top to bottom
      const elements = document.elementsFromPoint(x, y) as HTMLElement[];

      let found = false;
      for (const el of elements) {
        // Skip the header and everything inside it
        if (el === header || header.contains(el)) continue;

        // Skip elements whose bounding box doesn't actually overlap the navbar
        // (e.g. a hero video that's scrolled above but still in the element stack)
        const elRect = el.getBoundingClientRect();
        if (elRect.bottom < rect.top || elRect.top > rect.bottom) continue;

        const luminance = getElementLuminance(el);
        if (luminance !== null) {
          totalLuminance += luminance;
          sampleCount++;
          found = true;
          break;
        }
      }

      if (!found) {
        const bodyRgba = parseRGBA(
          window.getComputedStyle(document.body).backgroundColor
        );
        if (bodyRgba) {
          totalLuminance +=
            (0.2126 * bodyRgba.r +
              0.7152 * bodyRgba.g +
              0.0722 * bodyRgba.b) /
            255;
          sampleCount++;
        }
      }
    }

    if (sampleCount > 0) {
      const avg = totalLuminance / sampleCount;
      setContrast(avg < 0.45 ? "light" : "dark");
    }
  }, [headerRef]);

  useEffect(() => {
    let lastRun = 0;
    const tick = () => {
      const now = performance.now();
      if (now - lastRun > 200) {
        sample();
        lastRun = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [sample]);

  return contrast;
}

/**
 * Check a single element for its visual luminance.
 * Returns luminance (0-1) if determinable, null if transparent/unknown.
 *
 * Only treats media elements as dark if they span at least 70% of the
 * viewport width (full-bleed hero images). Smaller card images are
 * skipped so the background behind them gets detected.
 */
function getElementLuminance(el: HTMLElement): number | null {
  const tag = el.tagName.toLowerCase();
  const vw = window.innerWidth;

  // Media elements — only count as dark if they're full-width (hero-like)
  if (tag === "img" || tag === "video" || tag === "canvas") {
    const elRect = el.getBoundingClientRect();
    if (elRect.width >= vw * 0.7) {
      return 0.15;
    }
    // Small media (card images) — skip, let parent bg determine luminance
    return null;
  }

  const style = window.getComputedStyle(el);

  // CSS background images — only if element spans most of viewport
  const bgImage = style.backgroundImage;
  if (bgImage && bgImage !== "none" && bgImage.includes("url(")) {
    const elRect = el.getBoundingClientRect();
    if (elRect.width >= vw * 0.7) {
      return 0.15;
    }
    return null;
  }

  // Check background color
  const rgba = parseRGBA(style.backgroundColor);
  if (rgba && rgba.a > 0.3) {
    return (0.2126 * rgba.r + 0.7152 * rgba.g + 0.0722 * rgba.b) / 255;
  }

  return null;
}

function parseRGBA(
  color: string
): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/
  );
  if (!match) return null;
  return {
    r: Number.parseFloat(match[1]),
    g: Number.parseFloat(match[2]),
    b: Number.parseFloat(match[3]),
    a: match[4] !== undefined ? Number.parseFloat(match[4]) : 1,
  };
}
