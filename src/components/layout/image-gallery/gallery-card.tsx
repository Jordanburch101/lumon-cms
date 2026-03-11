"use client";

import { type MotionValue, motion, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import type { GalleryItem } from "./image-gallery-data";

interface GalleryCardProps {
  imageReady: boolean;
  index: number;
  item: GalleryItem;
  onImageLoad: (index: number) => void;
  progress: MotionValue<number>;
  total: number;
}

export function GalleryCard({
  imageReady,
  index,
  item,
  onImageLoad,
  progress,
  total,
}: GalleryCardProps) {
  const isBase = index === 0;
  const transitions = Math.max(total - 1, 1);
  const readyRef = useRef(isBase);

  // Keep ref in sync — useTransform callbacks capture the ref, not the prop
  readyRef.current = imageReady || isBase;

  // Each non-base card gets an equal slice of scroll for its clip reveal.
  // Base card (index 0) is always fully visible underneath.
  const tStart = (index - 1) / transitions;
  const tEnd = index / transitions;

  // Clip reveal: numeric 50 → 0, then mapped to inset() string.
  // Gate: if image isn't loaded, hold at 50 (fully clipped) so previous card stays visible.
  const clipValue = useTransform(progress, [tStart, tEnd], [50, 0]);
  const clip = useTransform(
    clipValue,
    (v) =>
      `inset(${readyRef.current ? v : 50}% ${readyRef.current ? v : 50}% ${readyRef.current ? v : 50}% ${readyRef.current ? v : 50}%)`
  );

  // Outgoing card: scale down slightly as the next card reveals over it
  const nextStart = index / transitions;
  const nextEnd = (index + 1) / transitions;
  const outScale = useTransform(progress, [nextStart, nextEnd], [1, 0.95]);

  // Text: fade in after the clip reveal is ~70% done, fade out as next card arrives
  const textIn = isBase ? 0 : tStart + (tEnd - tStart) * 0.65;
  const textOut =
    index < transitions ? nextStart + (nextEnd - nextStart) * 0.3 : 1;
  const textOpacity = useTransform(
    progress,
    [textIn, tEnd, textOut - 0.01, textOut],
    isBase ? [1, 1, 1, 0] : [0, 1, 1, 0]
  );
  const textY = useTransform(
    progress,
    [textIn, tEnd],
    isBase ? [0, 0] : [8, 0]
  );

  // Last card: text stays visible (no fade out)
  const isLast = index === total - 1;

  const lastTextOpacity = useTransform(progress, [textIn, tEnd], [0, 1]);
  const lastTextY = useTransform(progress, [textIn, tEnd], [8, 0]);

  const finalTextOpacity = isLast ? lastTextOpacity : textOpacity;
  const finalTextY = isLast ? lastTextY : textY;

  // Base card has no scale if it's also the last (only 1 card)
  const shouldScale = !isLast && index < transitions;

  return (
    <motion.figure
      className="absolute inset-0"
      style={{
        zIndex: index,
        clipPath: isBase ? undefined : clip,
        scale: shouldScale ? outScale : undefined,
      }}
    >
      <Image
        alt={item.imageAlt}
        blurDataURL={item.blurDataURL}
        className="object-cover"
        fill
        loading={index <= 2 ? "eager" : undefined}
        onLoad={() => onImageLoad(index)}
        placeholder={item.blurDataURL ? "blur" : "empty"}
        priority={index <= 1}
        sizes="100vw"
        src={item.imageSrc}
      />

      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-8 lg:p-16">
        <motion.span
          className="block font-medium text-[11px] text-white/50 uppercase tracking-[0.2em]"
          style={{ opacity: finalTextOpacity, y: finalTextY }}
        >
          {item.label}
        </motion.span>
        <motion.p
          className="mt-2 max-w-md font-light text-lg text-white/85 italic leading-relaxed lg:text-xl"
          style={{ opacity: finalTextOpacity, y: finalTextY }}
        >
          &ldquo;{item.caption}&rdquo;
        </motion.p>
      </figcaption>
    </motion.figure>
  );
}
