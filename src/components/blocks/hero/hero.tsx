import Image from "next/image";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { HeroBlock } from "@/types/block-types";
import { HeroCentered } from "./hero-centered";
import { HeroMinimal } from "./hero-minimal";
import { HeroSplit } from "./hero-split";

function getMediaType(src: string): "video" | "image" {
  return isVideoUrl(src) ? "video" : "image";
}

function HeroDefault({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroBlock) {
  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const mediaType = url ? getMediaType(url) : "image";

  const preloadHref = mediaType === "video" ? posterUrl || blurDataURL : url;

  return (
    <section
      className="relative min-h-[calc(100svh-56px)] w-full"
      data-navbar-contrast="light"
    >
      {/* Preload the LCP image — React 19 hoists this to <head> */}
      {preloadHref && (
        <link
          as="image"
          fetchPriority="high"
          href={preloadHref}
          rel="preload"
        />
      )}

      {/* Background media */}
      {url && mediaType === "video" && (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          data-field="mediaSrc"
          loop
          muted
          playsInline
          poster={posterUrl || blurDataURL || undefined}
          preload="auto"
          src={url}
        />
      )}
      {url && mediaType === "image" && (
        <Image
          alt="Hero background"
          blurDataURL={blurDataURL}
          className="object-cover"
          data-field="mediaSrc"
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
        <h1
          className="max-w-2xl font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
        >
          {headline}
        </h1>
        <p
          className="mt-4 max-w-xl text-base text-white/70"
          data-field="subtext"
        >
          {subtext}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CMSLink
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <CMSLink
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </div>
      </div>
    </section>
  );
}

export function Hero(props: HeroBlock) {
  const variant = props.variant ?? "default";

  switch (variant) {
    case "centered":
      return <HeroCentered {...props} />;
    case "split":
      return <HeroSplit {...props} />;
    case "minimal":
      return <HeroMinimal {...props} />;
    default:
      return <HeroDefault {...props} />;
  }
}
