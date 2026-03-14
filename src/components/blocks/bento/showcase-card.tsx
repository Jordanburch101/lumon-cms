"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useNearViewport } from "@/core/hooks/use-near-viewport";

export function ShowcaseCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isNear = useNearViewport(ref);

  return (
    <div
      className="relative h-full overflow-hidden rounded-xl border border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={ref}
    >
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />
      <video
        autoPlay
        className="h-full w-full object-cover brightness-75"
        loop
        muted
        playsInline
        preload="none"
        src={isNear ? "/hero-vid.mp4" : undefined}
      />
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        Showcase
      </span>
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">
            Visual Storytelling
          </span>
          <Badge className="bg-white/20 text-[10px] text-white">
            Cinematic
          </Badge>
        </div>
        <p className="mt-1 text-white/60 text-xs leading-relaxed">
          Full-bleed video and image blocks that bring your brand to life.
        </p>
      </div>
    </div>
  );
}
