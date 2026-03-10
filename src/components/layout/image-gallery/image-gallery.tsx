"use client";

import { useScroll } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { GalleryCard } from "./gallery-card";
import { galleryItems } from "./image-gallery-data";

const TOTAL = galleryItems.length;

export function ImageGallery() {
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
      style={{ height: `${TOTAL * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {galleryItems.map((item, i) => (
          <GalleryCard
            imageReady={loadedSet.has(i)}
            index={i}
            item={item}
            key={item.id}
            onImageLoad={handleImageLoad}
            progress={scrollYProgress}
            total={TOTAL}
          />
        ))}
      </div>
    </section>
  );
}
