"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { type PointerEvent, useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { getBlurDataURL, getMediaUrl, isVideoUrl } from "@/core/lib/utils";
import type { HeroCenteredBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

function MagneticCta({
  className,
  ...rest
}: {
  className?: string;
  "data-field-group"?: string;
  "data-field-group-type"?: string;
  link?: HeroCenteredBlock["primaryCta"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });
  const x = useTransform(springX, (v) => v * 0.15);
  const y = useTransform(springY, (v) => v * 0.15);

  function handlePointerMove(e: PointerEvent) {
    const el = ref.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }

  function handlePointerLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={ref}
      style={{ x, y }}
    >
      <CMSLink className={className} {...rest} />
    </motion.div>
  );
}

export function HeroCentered({
  mediaSrc,
  posterSrc,
  headline,
  subtext,
  primaryCta,
  secondaryCta,
}: HeroCenteredBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const url = getMediaUrl(mediaSrc);
  const blurDataURL = getBlurDataURL(mediaSrc);
  const posterUrl = getMediaUrl(posterSrc);
  const isVideo = url ? isVideoUrl(url) : false;

  const words = (headline?.split(" ") ?? []).map((word, i) => ({
    word,
    key: `w${i.toString(36)}-${word}`,
    delay: i * 0.04,
  }));

  return (
    <section
      className="relative flex min-h-[calc(100svh-56px)] w-full items-center justify-center overflow-hidden"
      data-navbar-contrast="light"
      ref={sectionRef}
    >
      {/* Background media */}
      {url && isVideo && (
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
      {url && !isVideo && (
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

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Grid overlay — one-shot fade after text reveals */}
      <motion.div
        animate={inView ? { opacity: [0.4, 0.2] } : {}}
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        initial={{ opacity: 0 }}
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
        transition={{ duration: 2, ease: EASE }}
      />

      {/* Centered content */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
        <h1
          className="font-semibold text-4xl text-white leading-tight sm:text-5xl lg:text-6xl"
          data-field="headline"
        >
          {words.map((w) => (
            <motion.span
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: 24 }}
              key={w.key}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: w.delay,
              }}
            >
              {w.word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mx-auto mt-6 max-w-xl text-base text-white/70 lg:text-lg"
          data-field="subtext"
          initial={{ opacity: 0, y: 16 }}
          transition={{
            duration: 0.7,
            ease: EASE,
            delay: words.length * 0.04 + 0.1,
          }}
        >
          {subtext}
        </motion.p>

        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          transition={{
            duration: 0.7,
            ease: EASE,
            delay: words.length * 0.04 + 0.2,
          }}
        >
          <MagneticCta
            className="bg-white text-black hover:bg-white/90"
            data-field-group="primaryCta"
            data-field-group-type="link"
            link={primaryCta}
          />
          <MagneticCta
            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            data-field-group="secondaryCta"
            data-field-group-type="link"
            link={secondaryCta}
          />
        </motion.div>
      </div>
    </section>
  );
}
