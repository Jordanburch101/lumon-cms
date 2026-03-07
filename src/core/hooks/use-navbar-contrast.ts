"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Determines whether navbar text should be light or dark by checking
 * which page section (marked with data-navbar-contrast) sits behind the navbar.
 *
 * Sections with dark backgrounds should set data-navbar-contrast="light"
 * (meaning the navbar text should be light/white). Default is "dark" (black text).
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

    // The vertical midpoint of the navbar — this is what we check against sections
    const navMidY = rect.top + rect.height / 2;

    // Find all sections that declare their contrast preference
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-navbar-contrast]"
    );

    let result: "light" | "dark" = "dark"; // default: dark text for light backgrounds

    for (const section of sections) {
      const sectionRect = section.getBoundingClientRect();

      // Check if the navbar midpoint falls within this section
      if (sectionRect.top <= navMidY && sectionRect.bottom >= navMidY) {
        result = section.dataset.navbarContrast as "light" | "dark";
        break;
      }
    }

    setContrast(result);
  }, [headerRef]);

  useEffect(() => {
    let lastRun = 0;
    const tick = () => {
      const now = performance.now();
      if (now - lastRun > 150) {
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
