import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import { imageCardData } from "./bento-data";

const VIDEO_RE = /\.(mp4|webm|ogg)$/i;

interface ImageCardProps {
  image?: {
    alt?: string;
    badge?: string;
    description?: string;
    src?: { url?: string; blurDataURL?: string } | string;
    title?: string;
  };
}

export function ImageCard({ image }: ImageCardProps) {
  const src = getMediaUrl(image?.src) || imageCardData.src;
  const blurDataURL = getBlurDataURL(image?.src);
  const alt = image?.alt || imageCardData.alt;
  const title = image?.title || imageCardData.title;
  const badge = image?.badge ?? imageCardData.badge;
  const description = image?.description || imageCardData.description;

  const isVideo = VIDEO_RE.test(src);

  return (
    <div className="relative h-full overflow-hidden rounded-xl border border-border/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="absolute inset-0 z-10 bg-primary opacity-20 mix-blend-color" />
      {isVideo ? (
        <video
          autoPlay
          className="h-full w-full object-cover brightness-75"
          loop
          muted
          playsInline
          src={src}
        />
      ) : (
        <Image
          alt={alt}
          blurDataURL={blurDataURL}
          className="object-cover brightness-75"
          fill
          placeholder={blurDataURL ? "blur" : "empty"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          src={src}
        />
      )}
      {/* Category label top-left */}
      <span className="absolute top-4 left-4 z-20 text-[11px] text-white/50 uppercase tracking-wider">
        Media
      </span>
      {/* Content overlay at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-white">{title}</span>
          {badge && (
            <Badge className="bg-white/20 text-[10px] text-white">
              {badge}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-white/60 text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
