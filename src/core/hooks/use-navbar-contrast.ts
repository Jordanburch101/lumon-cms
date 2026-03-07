"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Determines navbar contrast and scroll state from a single scroll listener.
 *
 * Sections with dark backgrounds should set data-navbar-contrast="light"
 * (meaning the navbar text should be light/white). Default is "dark" (black text).
 * In dark mode, always returns "light" (white text).
 *
 * Also tracks whether the page has scrolled past a threshold to toggle the
 * glass effect, eliminating the need for a separate useScrolled hook.
 */
export function useNavbarContrast(
  headerRef: React.RefObject<HTMLElement | null>,
  scrollThreshold = 10
) {
  const [contrast, setContrast] = useState<"light" | "dark">("dark");
  const [scrolled, setScrolled] = useState(false);
  const sectionsRef = useRef<HTMLElement[]>([]);

  // Cache section elements once on mount
  useEffect(() => {
    sectionsRef.current = Array.from(
      document.querySelectorAll<HTMLElement>("[data-navbar-contrast]")
    );
  }, []);

  const sample = useCallback(() => {
    // Update scroll state
    setScrolled(window.scrollY > scrollThreshold);

    if (document.documentElement.classList.contains("dark")) {
      setContrast((prev) => (prev === "light" ? prev : "light"));
      return;
    }

    const header = headerRef.current;
    if (!header) {
      return;
    }

    const rect = header.getBoundingClientRect();
    if (rect.height === 0) {
      return;
    }

    const navMidY = rect.top + rect.height / 2;

    let result: "light" | "dark" = "dark";

    for (const section of sectionsRef.current) {
      const sectionRect = section.getBoundingClientRect();

      if (sectionRect.top <= navMidY && sectionRect.bottom >= navMidY) {
        result = section.dataset.navbarContrast as "light" | "dark";
        break;
      }
    }

    setContrast((prev) => (prev === result ? prev : result));
  }, [headerRef, scrollThreshold]);

  useEffect(() => {
    sample();

    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", sample, { passive: true });

    const observer = new MutationObserver(sample);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("scroll", sample);
      window.removeEventListener("resize", sample);
      observer.disconnect();
    };
  }, [sample]);

  return { contrast, scrolled };
}
