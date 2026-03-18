"use client";

import { motion } from "motion/react";

import type { TrustBlock } from "@/types/block-types";

const EASE = [0.16, 1, 0.3, 1] as const;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** A single stat item from the CMS block data. */
type TrustStat = TrustBlock["stats"][number];

interface FlipCounterProps {
  delay?: number;
  inView: boolean;
  stat: TrustStat;
}

function formatValue(
  n: number,
  format?: ("none" | "k") | null,
  decimals?: number | null
): string {
  if (format === "k") {
    if (n >= 1000) {
      return `${Math.floor(n / 1000)}k`;
    }
    return Math.floor(n).toString();
  }
  if (decimals != null && decimals > 0) {
    return n.toFixed(decimals);
  }
  return Math.floor(n).toString();
}

/** Single digit column — scrolls through 0–9 like an odometer wheel */
function FlipDigit({
  digit,
  delay,
  inView,
}: {
  digit: number;
  delay: number;
  inView: boolean;
}) {
  return (
    <span
      className="relative inline-flex overflow-hidden"
      style={{ height: "1em", lineHeight: 1 }}
    >
      <motion.span
        animate={inView ? { y: `${-digit}em` } : { y: "0em" }}
        className="flex flex-col"
        style={{ lineHeight: 1 }}
        transition={{
          duration: digit === 0 ? 0 : 0.6 + digit * 0.1,
          ease: EASE,
          delay: digit === 0 ? 0 : delay,
        }}
      >
        {DIGITS.map((n) => (
          <span
            className="flex items-center justify-center"
            key={n}
            style={{ height: "1em" }}
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Static character (k, %, +, .) — fades in after digits start rolling */
function StaticChar({
  char,
  delay,
  inView,
}: {
  char: string;
  delay: number;
  inView: boolean;
}) {
  return (
    <motion.span
      animate={inView ? { opacity: 1 } : {}}
      initial={{ opacity: 0 }}
      style={{ lineHeight: 1 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      {char}
    </motion.span>
  );
}

export function FlipCounter({ stat, delay = 0, inView }: FlipCounterProps) {
  const formatted =
    formatValue(stat.value, stat.format, stat.decimals) + (stat.suffix ?? "");
  const chars = formatted.split("");

  // Per-character stagger within this counter
  const CHAR_STAGGER = 0.06;

  return (
    <span className="inline-flex">
      {chars.map((char, i) => {
        const charDelay = delay + i * CHAR_STAGGER;
        const parsed = Number.parseInt(char, 10);

        if (!Number.isNaN(parsed)) {
          return (
            <FlipDigit
              delay={charDelay}
              digit={parsed}
              inView={inView}
              // biome-ignore lint/suspicious/noArrayIndexKey: static char list from number — order never changes
              key={`${i}-${char}`}
            />
          );
        }

        return (
          <StaticChar
            char={char}
            delay={charDelay}
            inView={inView}
            // biome-ignore lint/suspicious/noArrayIndexKey: static char list from number — order never changes
            key={`${i}-${char}`}
          />
        );
      })}
    </span>
  );
}
