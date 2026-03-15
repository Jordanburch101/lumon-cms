"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { LogoCloudBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Scroll variant ────────────────────────────────────── */

function ScrollVariant({
  logos,
}: {
  logos: NonNullable<LogoCloudBlock["logos"]>;
}) {
  // Duplicate array for seamless infinite scroll
  const doubled = [...logos, ...logos];

  return (
    <div className="logo-cloud-scroll-track">
      <div className="logo-cloud-scroll-inner">
        {doubled.map((item, i) => {
          const isOriginal = i < logos.length;
          const logoUrl = getMediaUrl(item.logo);

          const logoIndex = i % logos.length;
          const blurData = getBlurDataURL(item.logo);

          const content = (
            <span
              className="logo-cloud-item"
              {...(isOriginal
                ? { "data-array-item": `logos.${String(i)}` }
                : {})}
            >
              {logoUrl && (
                <Image
                  alt={item.name}
                  blurDataURL={blurData}
                  className="h-6 w-auto opacity-70 brightness-0 dark:opacity-90 dark:invert"
                  data-field={
                    isOriginal ? `logos.${String(i)}.logo` : undefined
                  }
                  height={24}
                  placeholder={blurData ? "blur" : "empty"}
                  src={logoUrl}
                  width={120}
                />
              )}
              <span className="font-medium text-sm">{item.name}</span>
            </span>
          );

          // Wrap in CMSLink if a link label exists
          if (item.link?.label) {
            return (
              <CMSLink
                className="logo-cloud-item no-underline"
                data-field-group={`logos.${String(logoIndex)}.link`}
                data-field-group-type="link"
                key={`${item.id}-${String(i)}`}
                link={item.link}
              >
                {content}
              </CMSLink>
            );
          }

          return <span key={`${item.id}-${String(i)}`}>{content}</span>;
        })}
      </div>
    </div>
  );
}

/* ── Grid variant ──────────────────────────────────────── */

function GridVariant({
  logos,
  inView,
}: {
  logos: NonNullable<LogoCloudBlock["logos"]>;
  inView: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border/50 sm:grid-cols-3 lg:grid-cols-5">
      {logos.map((item, i) => {
        const logoUrl = getMediaUrl(item.logo);
        const blurData = getBlurDataURL(item.logo);

        const isLastOdd = i === logos.length - 1 && logos.length % 2 !== 0;
        const cell = (
          <motion.div
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            className={cn(
              "flex flex-col items-center justify-center bg-card px-6 py-8 text-muted-foreground transition-[background,color] duration-300 hover:bg-card/80 hover:text-foreground",
              isLastOdd && "col-span-2 sm:col-span-1"
            )}
            data-array-item={`logos.${String(i)}`}
            initial={{ opacity: 0, scale: 0.95 }}
            key={item.id}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: 0.1 + i * 0.04,
            }}
          >
            {logoUrl && (
              <Image
                alt={item.name}
                blurDataURL={blurData}
                className="mb-3 h-8 w-auto opacity-70 brightness-0 dark:opacity-90 dark:invert"
                data-field={`logos.${String(i)}.logo`}
                height={32}
                placeholder={blurData ? "blur" : "empty"}
                src={logoUrl}
                width={120}
              />
            )}
            <span
              className="font-medium text-foreground text-xs"
              data-field={`logos.${String(i)}.name`}
            >
              {item.name}
            </span>
          </motion.div>
        );

        if (item.link?.label) {
          return (
            <CMSLink
              className="no-underline"
              data-field-group={`logos.${String(i)}.link`}
              data-field-group-type="link"
              key={item.id}
              link={item.link}
            >
              {cell}
            </CMSLink>
          );
        }

        return cell;
      })}
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */

export function LogoCloud({ eyebrow, variant, logos }: LogoCloudBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <section aria-label="Partners" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Eyebrow */}
        {eyebrow && (
          <motion.p
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="mb-10 text-center font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
            data-field="eyebrow"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {eyebrow}
          </motion.p>
        )}

        {/* Variant switch */}
        {variant === "grid" ? (
          <GridVariant inView={inView} logos={logos} />
        ) : (
          <ScrollVariant logos={logos} />
        )}
      </div>
    </section>
  );
}
