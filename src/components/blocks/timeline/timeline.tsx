"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

import { FEATURE_ICONS } from "@/components/blocks/features-grid/icon-map";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { TimelineBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

type TimelineItem = TimelineBlock["items"][number];

function TimelineMilestone({
  item,
  index,
  total,
}: {
  index: number;
  item: TimelineItem;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const iconData = item.icon ? FEATURE_ICONS[item.icon] : null;
  const imageSrc = getMediaUrl(item.image);
  const blurDataURL = getBlurDataURL(item.image);
  const isEven = index % 2 === 0;
  const isLast = index === total - 1;

  return (
    <div
      className={cn(
        "group relative grid items-start gap-8",
        // Mobile: single column with line on left
        "grid-cols-[40px_1fr]",
        // Desktop: alternating 3-column layout
        "lg:grid-cols-[1fr_40px_1fr]"
      )}
      data-array-item={`items.${String(index)}`}
      ref={ref}
    >
      {/* Left content — visible on desktop for even items */}
      <div
        className={cn(
          "hidden lg:block",
          isEven ? "text-right" : "pointer-events-none"
        )}
      >
        {isEven && (
          <MilestoneContent
            blurDataURL={blurDataURL}
            iconData={iconData}
            imageSrc={imageSrc}
            index={index}
            inView={inView}
            item={item}
            side="left"
          />
        )}
      </div>

      {/* Center spine — dot + connecting line */}
      <div className="relative flex flex-col items-center">
        {/* Connecting line above dot */}
        {index > 0 && (
          <div className="absolute top-0 bottom-1/2 w-px bg-gradient-to-b from-border/30 to-border/60" />
        )}

        {/* Milestone dot */}
        <motion.div
          animate={
            inView
              ? {
                  opacity: 1,
                  scale: 1,
                }
              : {}
          }
          className="relative z-10 mt-1"
          initial={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        >
          {/* Glow ring */}
          <motion.div
            animate={
              inView
                ? {
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.8, 2.2],
                  }
                : {}
            }
            className="absolute inset-0 rounded-full bg-primary/30"
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: 0.3,
            }}
          />
          {/* Solid dot */}
          <div className="relative size-3 rounded-full border-2 border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.3)]" />
        </motion.div>

        {/* Connecting line below dot */}
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-border/60 to-border/30" />
        )}
      </div>

      {/* Right content — mobile always shows here, desktop shows for odd items */}
      <div className={cn("lg:hidden")}>
        <MilestoneContent
          blurDataURL={blurDataURL}
          iconData={iconData}
          imageSrc={imageSrc}
          index={index}
          inView={inView}
          item={item}
          side="right"
        />
      </div>

      {/* Desktop right column */}
      <div
        className={cn(
          "hidden lg:block",
          isEven ? "pointer-events-none" : "text-left"
        )}
      >
        {!isEven && (
          <MilestoneContent
            blurDataURL={blurDataURL}
            iconData={iconData}
            imageSrc={imageSrc}
            index={index}
            inView={inView}
            item={item}
            side="right"
          />
        )}
      </div>
    </div>
  );
}

function MilestoneContent({
  item,
  index,
  inView,
  iconData,
  imageSrc,
  blurDataURL,
  side,
}: {
  blurDataURL: string | undefined;
  iconData: (typeof FEATURE_ICONS)[string] | null;
  imageSrc: string;
  index: number;
  inView: boolean;
  item: TimelineItem;
  side: "left" | "right";
}) {
  const slideX = side === "left" ? 24 : -24;

  return (
    <motion.div
      animate={inView ? { opacity: 1, x: 0 } : {}}
      className="pb-12"
      initial={{ opacity: 0, x: slideX }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
    >
      {/* Date badge */}
      <motion.span
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mb-3 inline-block rounded-full border border-primary/20 bg-primary/8 px-3 py-1 font-mono text-[11px] text-primary uppercase tracking-[0.15em]"
        data-field={`items.${String(index)}.date`}
        initial={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
      >
        {item.date}
      </motion.span>

      {/* Icon + Heading row */}
      <motion.div
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mt-2 flex items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
      >
        {iconData && (
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/8"
            data-field={`items.${String(index)}.icon`}
          >
            <HugeiconsIcon className="size-4.5 text-primary" icon={iconData} />
          </div>
        )}
        <h3
          className="font-semibold text-lg leading-snug tracking-tight"
          data-field={`items.${String(index)}.heading`}
        >
          {item.heading}
        </h3>
      </motion.div>

      {/* Description */}
      <motion.p
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="mt-2 max-w-md text-muted-foreground text-sm leading-relaxed"
        data-field={`items.${String(index)}.description`}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
      >
        {item.description}
      </motion.p>

      {/* Optional image */}
      {imageSrc && (
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mt-4 overflow-hidden rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
        >
          <Image
            alt={item.heading}
            blurDataURL={blurDataURL}
            className="w-full object-cover"
            data-field={`items.${String(index)}.image`}
            height={300}
            placeholder={blurDataURL ? "blur" : "empty"}
            sizes="(max-width: 1024px) 90vw, 40vw"
            src={imageSrc}
            width={500}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export function Timeline({
  eyebrow,
  heading,
  description,
  items,
}: TimelineBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section aria-label="Timeline" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-16 max-w-2xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {eyebrow && (
            <p
              className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.3em]"
              data-field="eyebrow"
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            data-field="heading"
          >
            {heading}
          </h2>
          {description && (
            <p
              className="mt-3 text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Timeline */}
        {items && items.length > 0 && (
          <div className="relative">
            {items.map((item, i) => (
              <TimelineMilestone
                index={i}
                item={item}
                key={item.id ?? `${item.date}-${String(i)}`}
                total={items.length}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
