import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve a Payload Media relation (populated object, ID, or string URL) to a URL. */
export function getMediaUrl(
  media: number | string | { url?: string | null } | undefined | null
): string {
  if (!media || typeof media === "number") {
    return "";
  }
  if (typeof media === "string") {
    return media;
  }
  return media.url || "";
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
