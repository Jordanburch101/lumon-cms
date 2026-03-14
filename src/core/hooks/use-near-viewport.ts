"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Returns `true` once the observed element is within `rootMargin` of the
 * viewport. One-shot: once triggered it disconnects the observer and stays
 * `true` forever.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "200px"
): boolean {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isNear;
}
