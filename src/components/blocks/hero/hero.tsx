import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { HeroBlock } from "@/types/block-types";

const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;

function getMediaType(src: string): "video" | "image" {
  return VIDEO_EXTENSION_RE.test(src) ? "video" : "image";
}

export function Hero({
  mediaSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const mediaType = url ? getMediaType(url) : "image";

  return (
    <section
      className="relative min-h-[calc(100svh-56px)] w-full"
      data-navbar-contrast="light"
    >
      {/* Background media */}
      {url && mediaType === "video" && (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={url}
        />
      )}
      {url && mediaType === "image" && (
        <Image
          alt="Hero background"
          blurDataURL={blurDataURL}
          className="object-cover"
          fill
          placeholder={blurDataURL ? "blur" : "empty"}
          priority
          src={url}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <h1 className="max-w-2xl font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl">
          {headline}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70">{subtext}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            asChild
            className="bg-white text-black hover:bg-white/90"
            size="lg"
          >
            <Link href={primaryCta.href}>{primaryCta.label}</Link>
          </Button>
          <Button
            asChild
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            size="lg"
            variant="outline"
          >
            <a
              href={secondaryCta.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {secondaryCta.label}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
