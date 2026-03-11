import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/core/lib/utils";
import { heroData } from "./hero-data";

const VIDEO_EXTENSION_RE = /\.(mp4|webm|ogg)$/i;

function getMediaType(src: string): "video" | "image" {
  return VIDEO_EXTENSION_RE.test(src) ? "video" : "image";
}

interface HeroProps {
  headline?: string;
  mediaSrc?: { url?: string } | string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  subtext?: string;
}

export function Hero(props: HeroProps) {
  const mediaSrc = getMediaUrl(props.mediaSrc) || heroData.mediaSrc;
  const headline = props.headline || heroData.headline;
  const subtext = props.subtext || heroData.subtext;
  const primaryCtaLabel = props.primaryCta?.label || heroData.primaryCta.label;
  const primaryCtaHref = props.primaryCta?.href || heroData.primaryCta.href;
  const secondaryCtaLabel =
    props.secondaryCta?.label || heroData.secondaryCta.label;
  const secondaryCtaHref =
    props.secondaryCta?.href || heroData.secondaryCta.href;

  const mediaType = getMediaType(mediaSrc);

  return (
    <section
      className="relative min-h-[calc(100svh-56px)] w-full"
      data-navbar-contrast="light"
    >
      {/* Background media */}
      {mediaType === "video" ? (
        <video
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={mediaSrc}
        />
      ) : (
        <Image
          alt="Hero background"
          className="object-cover"
          fill
          priority
          src={mediaSrc}
        />
      )}

      {/* Gradient overlay: transparent at top → black/65 at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Content: bottom-left anchored */}
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
            <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
          </Button>
          <Button
            asChild
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            size="lg"
            variant="outline"
          >
            <a
              href={secondaryCtaHref}
              rel="noopener noreferrer"
              target="_blank"
            >
              {secondaryCtaLabel}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
