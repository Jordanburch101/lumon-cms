"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";
import type { StatsBarBlock } from "@/types/block-types";

/* ── Constants ─────────────────────────────────────── */

const EASE = [0.16, 1, 0.3, 1] as const;
const NUMERIC_RE = /^([+-]?)(\d[\d,]*\.?\d*)(.*)/;
const COMMA_RE = /,/g;
const THOUSANDS_RE = /\B(?=(\d{3})+(?!\d))/g;

/* ── Animated Value ────────────────────────────────── */

function AnimatedValue({
  value,
  inView,
  delay,
}: {
  value: string;
  inView: boolean;
  delay: number;
}) {
  // Start with the real value so the correct text shows if inView never fires
  const [displayed, setDisplayed] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) {
      return;
    }

    // Parse numeric portion for counter animation
    const numericMatch = value.match(NUMERIC_RE);
    if (!numericMatch) {
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;
    const sign = numericMatch[1];
    const numStr = numericMatch[2].replace(COMMA_RE, "");
    const suffix = numericMatch[3];
    const target = Number.parseFloat(numStr);
    const hasDecimal = numStr.includes(".");
    const decimals = hasDecimal ? numStr.split(".")[1].length : 0;
    const hasCommas = numericMatch[2].includes(",");

    const duration = 1200; // ms
    const startTime = performance.now() + delay * 1000;

    function formatNumber(n: number): string {
      const fixed = hasDecimal ? n.toFixed(decimals) : Math.round(n).toString();
      if (!hasCommas) {
        return fixed;
      }
      const [intPart, decPart] = fixed.split(".");
      const withCommas = intPart.replace(THOUSANDS_RE, ",");
      return decPart ? `${withCommas}.${decPart}` : withCommas;
    }

    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        setDisplayed(`${sign}${formatNumber(0)}${suffix}`);
        raf = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      const current = eased * target;
      setDisplayed(`${sign}${formatNumber(current)}${suffix}`);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplayed(value);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, delay, value]);

  return <span>{displayed}</span>;
}

/* ── Main Component ────────────────────────────────── */

export function StatsBar({
  eyebrow,
  variant = "default",
  stats,
}: StatsBarBlock) {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section className="w-full" ref={sectionRef}>
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

        {/* Stats grid */}
        <div
          className={cn(
            "grid",
            // Responsive columns based on stat count
            stats.length <= 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2 lg:grid-cols-4",
            stats.length === 5 && "lg:grid-cols-5",
            stats.length >= 6 && "lg:grid-cols-3 xl:grid-cols-6",
            // Variant-specific grid styling
            variant === "card" && "gap-4",
            variant === "default" &&
              "gap-px overflow-hidden rounded-lg border border-border/50 bg-border/50",
            variant === "minimal" && "gap-8 lg:gap-12"
          )}
        >
          {stats.map((stat, i) => (
            <motion.div
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className={cn(
                "relative flex flex-col",
                // ── Default: cells inside a bordered grid ──
                variant === "default" && [
                  "bg-card px-6 py-8 text-center",
                  "transition-[background] duration-300 hover:bg-accent/50",
                ],
                // ── Card: individual bordered cards ──
                variant === "card" && [
                  "rounded-lg border border-border/50 bg-card px-6 py-8 text-center",
                  "transition-all duration-300 hover:border-border hover:bg-accent/50 hover:shadow-sm",
                ],
                // ── Minimal: no borders, left-aligned ──
                variant === "minimal" && "py-2 text-center lg:text-left"
              )}
              data-array-item={`stats.${String(i)}`}
              initial={{ opacity: 0, y: 20 }}
              key={stat.id}
              transition={{
                duration: 0.7,
                ease: EASE,
                delay: 0.1 + i * 0.08,
              }}
            >
              {/* Value */}
              <div
                className={cn(
                  "font-semibold text-foreground tracking-tight",
                  variant === "minimal"
                    ? "text-4xl sm:text-5xl"
                    : "text-3xl sm:text-4xl lg:text-5xl"
                )}
                data-field={`stats.${String(i)}.value`}
              >
                <AnimatedValue
                  delay={0.1 + i * 0.08}
                  inView={inView}
                  value={stat.value}
                />
              </div>

              {/* Label */}
              <p
                className={cn(
                  "mt-2 font-mono text-[10px] uppercase tracking-[0.2em]",
                  variant === "minimal"
                    ? "text-foreground/70"
                    : "text-muted-foreground"
                )}
                data-field={`stats.${String(i)}.label`}
              >
                {stat.label}
              </p>

              {/* Description */}
              {stat.description && (
                <p
                  className="mt-2 text-muted-foreground text-xs leading-relaxed"
                  data-field={`stats.${String(i)}.description`}
                >
                  {stat.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
