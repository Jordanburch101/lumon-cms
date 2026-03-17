import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type MediaInput =
  | number
  | string
  | { url?: string | null; updatedAt?: string | null }
  | undefined
  | null;

/** Resolve a Payload Media relation to a clean URL (for next/image `src`). */
export function getMediaUrl(media: MediaInput): string {
  if (!media || typeof media === "number") {
    return "";
  }
  if (typeof media === "string") {
    return media;
  }
  return media.url || "";
}

/** Resolve a Payload Media relation to a cache-busted URL (for `<video>`, `<a>`, direct embeds).
 *  Appends `?v=updatedAt` so CDN/browser caches invalidate on crop or re-upload. */
export function getMediaUrlBusted(media: MediaInput): string {
  const url = getMediaUrl(media);
  if (
    !url ||
    typeof media === "string" ||
    typeof media === "number" ||
    !media?.updatedAt
  ) {
    return url;
  }
  const v = new Date(media.updatedAt).getTime();
  return `${url}?v=${String(v)}`;
}

/** Extract blurDataURL from a Payload Media object for next/image placeholder. */
export function getBlurDataURL(
  media: number | string | { blurDataURL?: string | null } | undefined | null
): string | undefined {
  if (!media || typeof media === "number" || typeof media === "string") {
    return undefined;
  }
  return media.blurDataURL || undefined;
}

/** Test whether a URL points to a video file. */
export const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;
export function isVideoUrl(src: string): boolean {
  return VIDEO_EXTENSION_RE.test(src);
}
