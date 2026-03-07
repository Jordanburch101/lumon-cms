"use client";

import { useScroll } from "motion/react";
import { useRef } from "react";

import { GalleryCard } from "./gallery-card";
import { galleryItems } from "./image-gallery-data";

const TOTAL = galleryItems.length;

export function ImageGallery() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

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
            index={i}
            item={item}
            key={item.id}
            progress={scrollYProgress}
            total={TOTAL}
          />
        ))}
      </div>
    </section>
  );
}
