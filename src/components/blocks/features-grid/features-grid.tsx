"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import type { FeaturesGridBlock } from "@/types/block-types";

import { FEATURE_ICONS } from "./icon-map";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FeaturesGrid({
  eyebrow,
  heading,
  description,
  items,
}: FeaturesGridBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section aria-label="Features" className="w-full" ref={sectionRef}>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 max-w-2xl"
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

        {/* Grid */}
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const iconData = item.icon ? FEATURE_ICONS[item.icon] : null;

              return (
                <motion.div
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className="bg-card p-8 transition-colors duration-300 hover:bg-card/80"
                  data-array-item={`items.${String(i)}`}
                  initial={{ opacity: 0, y: 16 }}
                  key={item.id}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: 0.1 + i * 0.05,
                  }}
                >
                  {/* Icon */}
                  {iconData && (
                    <div
                      className="mb-4 flex size-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/8"
                      data-field={`items.${String(i)}.icon`}
                    >
                      <HugeiconsIcon
                        className="size-5 text-primary"
                        icon={iconData}
                      />
                    </div>
                  )}

                  {/* Label */}
                  {item.label && (
                    <p
                      className="mb-2 font-mono text-[10px] text-primary uppercase tracking-[0.2em]"
                      data-field={`items.${String(i)}.label`}
                    >
                      {item.label}
                    </p>
                  )}

                  {/* Heading */}
                  <h3
                    className="font-semibold text-base"
                    data-field={`items.${String(i)}.heading`}
                  >
                    {item.heading}
                  </h3>

                  {/* Description */}
                  <p
                    className="mt-2 text-muted-foreground text-sm leading-relaxed"
                    data-field={`items.${String(i)}.description`}
                  >
                    {item.description}
                  </p>

                  {/* Optional link */}
                  {item.link?.label && (
                    <div className="mt-4">
                      <CMSLink
                        className="font-medium text-foreground text-sm underline underline-offset-4 transition-colors hover:text-foreground/70"
                        data-field-group={`items.${String(i)}.link`}
                        data-field-group-type="link"
                        link={item.link}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
