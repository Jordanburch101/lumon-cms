import { Badge } from "@/components/ui/badge";
import { imageCardData } from "./bento-data";

export function ImageCard() {
  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />
      <video
        autoPlay
        className="h-full w-full object-cover brightness-75"
        loop
        muted
        playsInline
        src="/bento-vid.mp4"
      />
      {/* Category label top-left */}
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        Media
      </span>
      {/* Content overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">
            {imageCardData.title}
          </span>
          <Badge className="bg-white/20 text-[10px] text-white">
            {imageCardData.badge}
          </Badge>
        </div>
        <p className="mt-1 text-white/60 text-xs leading-relaxed">
          {imageCardData.description}
        </p>
      </div>
    </div>
  );
}
