"use client";

import Image from "next/image";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useNearViewport } from "@/core/hooks/use-near-viewport";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { BentoBlock } from "@/types/block-types";

export function ShowcaseCard({
  showcase,
}: {
  showcase: BentoBlock["showcase"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(ref);

  const src = showcase ? getMediaUrl(showcase.src) : null;
  const blurDataURL = showcase ? getBlurDataURL(showcase.src) : undefined;
  const isVideo = src ? isVideoUrl(src) : false;
  const title = showcase?.title ?? "Visual Storytelling";
  const description =
    showcase?.description ??
    "Full-bleed video and image blocks that bring your brand to life.";
  const badge = showcase?.badge ?? null;

  return (
    <div
      className="relative h-full overflow-hidden rounded-xl border border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={ref}
    >
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />
      {isNear && src && isVideo && (
        <video
          autoPlay
          className="h-full w-full object-cover brightness-75"
          data-field="showcase.src"
          loop
          muted
          playsInline
          poster={blurDataURL || undefined}
          preload="none"
          src={src}
        />
      )}
      {isNear && src && !isVideo && (
        <Image
          alt={showcase?.alt ?? ""}
          blurDataURL={blurDataURL}
          className="object-cover brightness-75"
          data-field="showcase.src"
          fill
          placeholder={blurDataURL ? "blur" : "empty"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
          src={src}
        />
      )}
      {!(src && isNear) && (
        <video
          autoPlay
          className="h-full w-full object-cover brightness-75"
          loop
          muted
          playsInline
          preload="none"
          src={isNear ? "/hero-vid.mp4" : undefined}
        />
      )}
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        Showcase
      </span>
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span
            className="font-medium text-sm text-white"
            data-field="showcase.title"
          >
            {title}
          </span>
          {badge && (
            <Badge className="bg-white/20 text-[10px] text-white">
              <span data-field="showcase.badge">{badge}</span>
            </Badge>
          )}
        </div>
        <p
          className="mt-1 text-white/60 text-xs leading-relaxed"
          data-field="showcase.description"
        >
          {description}
        </p>
      </div>
    </div>
  );
}
