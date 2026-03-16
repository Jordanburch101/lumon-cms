"use client";

import { motion, useInView } from "motion/react";
import { Fragment, useRef } from "react";

import { CMSLink } from "@/components/ui/cms-link";
import { cn } from "@/core/lib/utils";
import type { ComparisonTableBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Included"
      className={cn("size-5", className)}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Not included"
      className={cn("size-5", className)}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M8 12h8" />
    </svg>
  );
}

function PartialIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Partially included"
      className={cn("size-5", className)}
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
    >
      <path
        clipRule="evenodd"
        d="M12 3a9 9 0 100 18 9 9 0 000-18zM1 12C1 5.925 5.925 1 12 1s11 4.925 11 11-4.925 11-11 11S1 18.075 1 12z"
        fillRule="evenodd"
        opacity={0.2}
      />
      <path d="M12 1a11 11 0 010 22V1z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="More information"
      className={cn("size-3.5", className)}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <circle cx={12} cy={12} r={10} />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Value cell renderer                                                */
/* ------------------------------------------------------------------ */

type ValueType = "included" | "excluded" | "partial" | "text";

function ValueCell({
  value,
  textValue,
  recommended,
}: {
  value?: ValueType | null;
  textValue?: string | null;
  recommended?: boolean;
}) {
  switch (value) {
    case "included":
      return (
        <CheckIcon
          className={cn(recommended ? "text-primary" : "text-primary/70")}
        />
      );
    case "excluded":
      return <DashIcon className="text-muted-foreground/30" />;
    case "partial":
      return (
        <PartialIcon
          className={cn(
            "size-4",
            recommended ? "text-primary/80" : "text-primary/50"
          )}
        />
      );
    case "text":
      return (
        <span
          className={cn(
            "text-sm",
            recommended
              ? "font-medium text-foreground"
              : "text-muted-foreground"
          )}
        >
          {textValue}
        </span>
      );
    default:
      return <DashIcon className="text-muted-foreground/30" />;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type Feature = NonNullable<ComparisonTableBlock["features"]>[number];
type Plan = NonNullable<ComparisonTableBlock["plans"]>[number];
type PlanValue = NonNullable<Plan["values"]>[number];

/** Group features by category, preserving order. Uncategorised features go first. */
function groupFeatures(features: Feature[]) {
  const groups: { category: string | null; items: Feature[] }[] = [];
  const seen = new Map<string | null, number>();

  for (const f of features) {
    const cat = f.category || null;
    const existingIdx = seen.get(cat);
    if (existingIdx !== undefined) {
      groups[existingIdx].items.push(f);
    } else {
      seen.set(cat, groups.length);
      groups.push({ category: cat, items: [f] });
    }
  }
  return groups;
}

/** Look up a plan's value for a given feature index. */
function findValue(plan: Plan, featureIndex: number): PlanValue | undefined {
  return plan.values?.find((v) => v.featureIndex === featureIndex);
}

/** Get the index of a feature in the features array. */
function featureIdx(features: Feature[], feature: Feature): number {
  return features.indexOf(feature);
}

/* ------------------------------------------------------------------ */
/*  Desktop table                                                      */
/* ------------------------------------------------------------------ */

function DesktopTable({
  features,
  plans,
  inView,
}: {
  features: Feature[];
  plans: Plan[];
  inView: boolean;
}) {
  const groups = groupFeatures(features);
  const planCount = plans.length;

  return (
    <div className="hidden lg:block">
      <div className="overflow-hidden rounded-xl border border-border/50">
        {/* ---- Sticky plan headers ---- */}
        <div className="sticky top-0 z-10 border-border/50 border-b bg-background/95 backdrop-blur-sm">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `minmax(240px, 1.5fr) repeat(${String(planCount)}, minmax(0, 1fr))`,
            }}
          >
            {/* Spacer for feature-name column */}
            <div className="p-6" />

            {plans.map((plan, i) => {
              const rec = plan.recommended ?? false;
              return (
                <motion.div
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className={cn(
                    "relative flex flex-col items-center px-6 pt-8 pb-6 text-center",
                    rec && "bg-primary/[0.04]",
                    i > 0 && "border-border/50 border-l"
                  )}
                  data-array-item={`plans.${String(i)}`}
                  initial={{ opacity: 0, y: 16 }}
                  key={plan.id ?? i}
                  transition={{
                    duration: 0.6,
                    ease: EASE,
                    delay: 0.1 + i * 0.06,
                  }}
                >
                  {/* Recommended accent bar */}
                  {rec && (
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />
                  )}

                  {/* Badge */}
                  {rec && (
                    <span className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-0.5 font-mono text-[10px] text-primary uppercase tracking-[0.2em]">
                      Recommended
                    </span>
                  )}

                  {/* Plan name */}
                  <span
                    className="font-semibold text-sm"
                    data-field={`plans.${String(i)}.name`}
                  >
                    {plan.name}
                  </span>

                  {/* Price */}
                  {plan.price && (
                    <span
                      className="mt-1 font-semibold text-2xl tracking-tight"
                      data-field={`plans.${String(i)}.price`}
                    >
                      {plan.price}
                    </span>
                  )}

                  {/* Description */}
                  {plan.description && (
                    <span
                      className="mt-1.5 text-muted-foreground text-xs leading-relaxed"
                      data-field={`plans.${String(i)}.description`}
                    >
                      {plan.description}
                    </span>
                  )}

                  {/* CTA */}
                  <div className="mt-4 w-full">
                    <CMSLink
                      className="w-full"
                      data-field-group={`plans.${String(i)}.cta`}
                      data-field-group-type="link"
                      link={plan.cta}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ---- Feature rows ---- */}
        {groups.map((group, gi) => (
          <Fragment key={group.category ?? `_uncategorised_${String(gi)}`}>
            {/* Category header */}
            {group.category && (
              <motion.div
                animate={inView ? { opacity: 1 } : {}}
                className="border-border/50 border-b bg-muted/30 px-6 py-3"
                initial={{ opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.2 + gi * 0.04,
                }}
              >
                <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
                  {group.category}
                </span>
              </motion.div>
            )}

            {group.items.map((feature, fi) => {
              const idx = featureIdx(features, feature);
              const rowDelay = 0.15 + (gi * group.items.length + fi) * 0.025;

              return (
                <motion.div
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  className={cn(
                    "grid border-border/30 border-b transition-colors duration-200 last:border-b-0 hover:bg-muted/20"
                  )}
                  initial={{ opacity: 0, y: 8 }}
                  key={feature.id ?? idx}
                  style={{
                    gridTemplateColumns: `minmax(240px, 1.5fr) repeat(${String(planCount)}, minmax(0, 1fr))`,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: rowDelay,
                  }}
                >
                  {/* Feature name */}
                  <div className="flex items-center gap-2 px-6 py-4">
                    <span
                      className="text-foreground/80 text-sm"
                      data-field={`features.${String(idx)}.name`}
                    >
                      {feature.name}
                    </span>
                    {feature.tooltip && (
                      <span
                        className="group relative cursor-help"
                        title={feature.tooltip}
                      >
                        <InfoIcon className="text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                      </span>
                    )}
                  </div>

                  {/* Values per plan */}
                  {plans.map((plan, pi) => {
                    const rec = plan.recommended ?? false;
                    const val = findValue(plan, idx);
                    return (
                      <div
                        className={cn(
                          "flex items-center justify-center border-border/30 border-l px-6 py-4",
                          rec && "bg-primary/[0.04]"
                        )}
                        key={plan.id ?? pi}
                      >
                        <ValueCell
                          recommended={rec}
                          textValue={val?.textValue}
                          value={val?.value}
                        />
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile cards                                                       */
/* ------------------------------------------------------------------ */

function MobileCards({
  features,
  plans,
  inView,
}: {
  features: Feature[];
  plans: Plan[];
  inView: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 lg:hidden">
      {plans.map((plan, pi) => {
        const rec = plan.recommended ?? false;
        return (
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className={cn(
              "relative overflow-hidden rounded-xl border",
              rec
                ? "border-primary/30 bg-primary/[0.03]"
                : "border-border/50 bg-card"
            )}
            initial={{ opacity: 0, y: 24 }}
            key={plan.id ?? pi}
            transition={{
              duration: 0.7,
              ease: EASE,
              delay: 0.1 + pi * 0.08,
            }}
          >
            {/* Accent bar */}
            {rec && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-primary" />
            )}

            {/* Plan header */}
            <div
              className="flex flex-col items-center border-border/30 border-b px-6 pt-6 pb-5 text-center"
              data-array-item={`plans.${String(pi)}`}
            >
              {rec && (
                <span className="mb-2 inline-flex rounded-full bg-primary/10 px-3 py-0.5 font-mono text-[10px] text-primary uppercase tracking-[0.2em]">
                  Recommended
                </span>
              )}
              <span
                className="font-semibold text-base"
                data-field={`plans.${String(pi)}.name`}
              >
                {plan.name}
              </span>
              {plan.price && (
                <span
                  className="mt-1 font-semibold text-2xl tracking-tight"
                  data-field={`plans.${String(pi)}.price`}
                >
                  {plan.price}
                </span>
              )}
              {plan.description && (
                <span
                  className="mt-1.5 text-muted-foreground text-xs leading-relaxed"
                  data-field={`plans.${String(pi)}.description`}
                >
                  {plan.description}
                </span>
              )}
              <div className="mt-4 w-full">
                <CMSLink
                  className="w-full"
                  data-field-group={`plans.${String(pi)}.cta`}
                  data-field-group-type="link"
                  link={plan.cta}
                />
              </div>
            </div>

            {/* Feature list */}
            <div className="divide-y divide-border/20">
              {features.map((feature, fi) => {
                const val = findValue(plan, fi);
                return (
                  <div
                    className="flex items-center justify-between px-6 py-3.5"
                    key={feature.id ?? fi}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground/70 text-sm">
                        {feature.name}
                      </span>
                      {feature.tooltip && (
                        <span className="cursor-help" title={feature.tooltip}>
                          <InfoIcon className="text-muted-foreground/40" />
                        </span>
                      )}
                    </div>
                    <ValueCell
                      recommended={rec}
                      textValue={val?.textValue}
                      value={val?.value}
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function ComparisonTable({
  eyebrow,
  heading,
  description,
  features,
  plans,
}: ComparisonTableBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  const featureList = features ?? [];
  const planList = plans ?? [];

  if (featureList.length === 0 || planList.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Plan comparison"
      className="w-full scroll-mt-16"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12 text-center"
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
              className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground"
              data-field="description"
            >
              {description}
            </p>
          )}
        </motion.div>

        {/* Desktop table */}
        <DesktopTable features={featureList} inView={inView} plans={planList} />

        {/* Mobile card stack */}
        <MobileCards features={featureList} inView={inView} plans={planList} />
      </div>
    </section>
  );
}
