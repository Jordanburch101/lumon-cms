import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { imageCardData } from "./bento-data";

export function ImageCard() {
  return (
    <div className="relative h-full overflow-hidden rounded-lg">
      {/* Primary tint overlay */}
      <div className="absolute inset-0 z-10 bg-primary opacity-40 mix-blend-color" />
      {/* Image fills entire card */}
      <Image
        alt={imageCardData.alt}
        className="h-full w-full object-cover brightness-50 grayscale"
        height={400}
        src={imageCardData.src}
        width={400}
      />
      {/* Text overlay at bottom */}
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
