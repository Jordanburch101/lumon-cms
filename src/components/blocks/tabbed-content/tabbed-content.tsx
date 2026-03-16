"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { FEATURE_ICONS } from "@/components/blocks/features-grid/icon-map";
import { cn, getBlurDataURL, getMediaUrl } from "@/core/lib/utils";
import type { TabbedContentBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

type Tab = TabbedContentBlock["tabs"][number];

export function TabbedContent({
  eyebrow,
  heading,
  description,
  tabs,
}: TabbedContentBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(0);

  const activeTab = tabs[activeIndex];

  return (
    <section
      aria-label="Tabbed content"
      className="w-full scroll-mt-16"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 max-w-2xl lg:mb-14"
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

        {/* Tab navigation */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="relative mb-10 lg:mb-14"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        >
          <div
            className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-border/50 bg-muted/30 p-1"
            role="tablist"
          >
            {tabs.map((tab, i) => {
              const isActive = i === activeIndex;
              const iconData = tab.icon ? FEATURE_ICONS[tab.icon] : null;

              return (
                <button
                  aria-controls={`tabpanel-${String(i)}`}
                  aria-selected={isActive}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors duration-200",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/70"
                  )}
                  data-field={`tabs.${String(i)}.label`}
                  key={tab.id ?? tab.label}
                  onClick={() => setActiveIndex(i)}
                  role="tab"
                  type="button"
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-lg bg-card shadow-sm"
                      layoutId="tabbed-content-pill"
                      style={{ zIndex: -1 }}
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                  {iconData && (
                    <HugeiconsIcon
                      className={cn(
                        "size-4 transition-colors duration-200",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                      icon={iconData}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab content panel */}
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby={`tab-${String(activeIndex)}`}
            className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
            exit={{ opacity: 0, y: 8 }}
            id={`tabpanel-${String(activeIndex)}`}
            initial={{ opacity: 0, y: 12 }}
            key={activeIndex}
            role="tabpanel"
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Text content */}
            <TabTextContent index={activeIndex} tab={activeTab} />

            {/* Image */}
            <TabImage index={activeIndex} tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab text content                                                   */
/* ------------------------------------------------------------------ */

function TabTextContent({ tab, index }: { index: number; tab: Tab }) {
  return (
    <div className="flex flex-col justify-center">
      <h3
        className="font-semibold text-2xl leading-snug tracking-tight sm:text-3xl"
        data-field={`tabs.${String(index)}.heading`}
      >
        {tab.heading}
      </h3>
      <p
        className="mt-4 max-w-lg text-base text-muted-foreground leading-relaxed"
        data-field={`tabs.${String(index)}.description`}
      >
        {tab.description}
      </p>

      {/* Features list */}
      {tab.features && tab.features.length > 0 && (
        <ul className="mt-8 flex flex-col gap-3">
          {tab.features.map((feature, fi) => (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
              data-field={`tabs.${String(index)}.features.${String(fi)}.text`}
              initial={{ opacity: 0, x: -8 }}
              key={feature.id ?? feature.text}
              transition={{
                duration: 0.4,
                ease: EASE,
                delay: 0.05 * fi,
              }}
            >
              <span className="mt-1.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <svg
                  aria-hidden="true"
                  className="size-3 text-primary"
                  fill="none"
                  role="img"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <title>Checkmark</title>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="text-foreground/80 text-sm leading-relaxed">
                {feature.text}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab image                                                          */
/* ------------------------------------------------------------------ */

function TabImage({ tab, index }: { index: number; tab: Tab }) {
  const mediaSrc = getMediaUrl(tab.image);
  const blurDataURL = getBlurDataURL(tab.image);

  if (!mediaSrc) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted"
      initial={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
    >
      <Image
        alt={tab.heading}
        blurDataURL={blurDataURL}
        className="object-cover"
        data-field={`tabs.${String(index)}.image`}
        fill
        placeholder={blurDataURL ? "blur" : "empty"}
        sizes="(max-width: 1024px) 100vw, 50vw"
        src={mediaSrc}
      />
    </motion.div>
  );
}
