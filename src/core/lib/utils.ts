import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve a Payload Media relation (populated object, ID, or string URL) to a URL.
 *  Appends `?v=updatedAt` when available to bust CDN/browser caches on re-upload or crop. */
export function getMediaUrl(
  media:
    | number
    | string
    | { url?: string | null; updatedAt?: string | null }
    | undefined
    | null
): string {
  if (!media || typeof media === "number") {
    return "";
  }
  if (typeof media === "string") {
    return media;
  }
  const url = media.url || "";
  if (!(url && media.updatedAt)) {
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
