import Image from "next/image";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";

const sizeClasses = {
  full: "max-w-full",
  large: "max-w-4xl",
  medium: "max-w-2xl",
  small: "max-w-md",
} as const;

const alignClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
} as const;

type MediaSize = keyof typeof sizeClasses;
type MediaAlignment = keyof typeof alignClasses;

export function MediaConverter({
  node,
}: {
  node: {
    fields: {
      mediaSrc:
        | {
            url?: string;
            width?: number;
            height?: number;
            blurDataURL?: string;
            alt?: string;
            mimeType?: string;
          }
        | number;
      caption?: string;
      credit?: string;
      creditUrl?: string;
      size?: MediaSize;
      alignment?: MediaAlignment;
      rounded?: boolean;
    };
  };
}) {
  const {
    mediaSrc,
    caption,
    credit,
    creditUrl,
    size = "full",
    alignment = "center",
    rounded = true,
  } = node.fields;

  const url = getMediaUrl(mediaSrc);
  if (!url) {
    return null;
  }

  const isVideo =
    typeof mediaSrc === "object" && mediaSrc.mimeType?.startsWith("video/");
  const blurDataURL = getBlurDataURL(mediaSrc);
  const width = typeof mediaSrc === "object" ? (mediaSrc.width ?? 1200) : 1200;
  const height = typeof mediaSrc === "object" ? (mediaSrc.height ?? 675) : 675;
  const alt = typeof mediaSrc === "object" ? (mediaSrc.alt ?? "") : "";

  const creditElement = credit ? (
    <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white/80 backdrop-blur-sm">
      {credit}
    </span>
  ) : null;

  return (
    <figure
      className={cn(
        "not-prose my-8",
        sizeClasses[size],
        alignClasses[alignment]
      )}
    >
      <div className={cn("relative overflow-hidden", rounded && "rounded-lg")}>
        {isVideo ? (
          <video className="w-full" controls src={url} />
        ) : (
          <Image
            alt={alt}
            blurDataURL={blurDataURL}
            className="w-full"
            height={height}
            placeholder={blurDataURL ? "blur" : "empty"}
            src={url}
            width={width}
          />
        )}
        {creditUrl ? (
          <a href={creditUrl} rel="noopener noreferrer" target="_blank">
            {creditElement}
          </a>
        ) : (
          creditElement
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-muted-foreground text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
