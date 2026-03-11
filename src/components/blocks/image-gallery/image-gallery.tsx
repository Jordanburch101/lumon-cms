"use client";

import { useScroll } from "motion/react";
import { useCallback, useRef, useState } from "react";

import type { ImageGalleryBlock } from "@/types/block-types";
import { GalleryCard } from "./gallery-card";

export function ImageGallery({ items }: ImageGalleryBlock) {
  const total = items.length;
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [loadedSet, setLoadedSet] = useState<Set<number>>(() => new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedSet((prev) => {
      if (prev.has(index)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  return (
    <section
      className="bg-black"
      data-navbar-contrast="light"
      ref={containerRef}
      style={{ height: `${total * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {items.map((item, i) => (
          <GalleryCard
            imageReady={loadedSet.has(i)}
            index={i}
            item={item}
            key={item.id ?? `g-${i}`}
            onImageLoad={handleImageLoad}
            progress={scrollYProgress}
            total={total}
          />
        ))}
      </div>
    </section>
  );
}
