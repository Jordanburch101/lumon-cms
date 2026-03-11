"use client";

import { useScroll } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { getMediaUrl } from "@/core/lib/utils";
import { GalleryCard } from "./gallery-card";
import {
  galleryItems as defaultItems,
  type GalleryItem,
} from "./image-gallery-data";

interface ImageGalleryProps {
  items?: {
    caption: string;
    id?: string;
    image?: { url?: string } | string;
    imageAlt: string;
    label: string;
  }[];
}

/** Map a Payload gallery item to the internal GalleryItem shape. */
function toGalleryItem(
  item: NonNullable<ImageGalleryProps["items"]>[number],
  index: number
): GalleryItem {
  return {
    id: item.id || `g-${index}`,
    label: item.label,
    caption: item.caption,
    imageSrc: getMediaUrl(item.image),
    imageAlt: item.imageAlt,
  };
}

export function ImageGallery(props: ImageGalleryProps) {
  const items =
    props.items && props.items.length > 0
      ? props.items.map(toGalleryItem)
      : defaultItems;

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
            key={item.id}
            onImageLoad={handleImageLoad}
            progress={scrollYProgress}
            total={total}
          />
        ))}
      </div>
    </section>
  );
}
