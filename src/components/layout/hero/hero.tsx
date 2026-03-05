import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { heroData } from "./hero-data";

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-56px)] w-full">
      {/* Background photo */}
      <Image
        alt="Hero background"
        className="object-cover"
        fill
        priority
        src="/hero-bg.jpg"
      />

      {/* Gradient overlay: transparent at top → black/65 at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

      {/* Content: bottom-left anchored */}
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        <h1 className="max-w-2xl font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl">
          {heroData.headline}
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70">
          {heroData.subtext}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={heroData.primaryCta.href}>
              {heroData.primaryCta.label}
            </Link>
          </Button>
          <Button
            asChild
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            size="lg"
            variant="outline"
          >
            <a
              href={heroData.secondaryCta.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {heroData.secondaryCta.label}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
