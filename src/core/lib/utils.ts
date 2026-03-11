import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Resolve a Payload Media object or plain string to a URL. */
export function getMediaUrl(
  media: string | { url?: string } | undefined | null
): string {
  if (!media) {
    return "";
  }
  if (typeof media === "string") {
    return media;
  }
  return media.url || "";
}

/** Extract blurDataURL from a Payload Media object for next/image placeholder. */
export function getBlurDataURL(
  media: string | { blurDataURL?: string } | undefined | null
): string | undefined {
  if (!media || typeof media === "string") {
    return undefined;
  }
  return media.blurDataURL || undefined;
}
