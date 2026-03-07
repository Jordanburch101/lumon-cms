"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Determines whether navbar text should be light or dark by checking
 * which page section (marked with data-navbar-contrast) sits behind the navbar.
 *
 * Sections with dark backgrounds should set data-navbar-contrast="light"
 * (meaning the navbar text should be light/white). Default is "dark" (black text).
 * In dark mode, always returns "light" (white text).
 */
export function useNavbarContrast(
  headerRef: React.RefObject<HTMLElement | null>
) {
  const [contrast, setContrast] = useState<"light" | "dark">("dark");

  const sample = useCallback(() => {
    if (document.documentElement.classList.contains("dark")) {
      setContrast("light");
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

    const sections = document.querySelectorAll<HTMLElement>(
      "[data-navbar-contrast]"
    );

    let result: "light" | "dark" = "dark";

    for (const section of sections) {
      const sectionRect = section.getBoundingClientRect();

      if (sectionRect.top <= navMidY && sectionRect.bottom >= navMidY) {
        result = section.dataset.navbarContrast as "light" | "dark";
        break;
      }
    }

    setContrast(result);
  }, [headerRef]);

  useEffect(() => {
    // Run once immediately
    sample();

    window.addEventListener("scroll", sample, { passive: true });
    window.addEventListener("resize", sample, { passive: true });

    // Also re-check when theme changes (class mutation on <html>)
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

  return contrast;
}
