"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";

interface CountUpProps {
  decimals?: number;
  format?: "k";
  inView: boolean;
  suffix?: string;
  target: number;
}

function formatValue(n: number, format?: "k", decimals?: number): string {
  if (format === "k") {
    if (n >= 1000) {
      return `${Math.floor(n / 1000)}k`;
    }
    return Math.floor(n).toString();
  }
  if (decimals !== undefined && decimals > 0) {
    return n.toFixed(decimals);
  }
  return Math.floor(n).toString();
}

export function CountUp({
  target,
  format,
  decimals,
  suffix = "",
  inView,
}: CountUpProps) {
  const mv = useMotionValue(0);
  const display = useTransform(
    mv,
    (v) => formatValue(v, format, decimals) + suffix
  );

  useEffect(() => {
    if (!inView) {
      return;
    }
    const controls = animate(mv, target, {
      duration: 2.2,
      ease: [0.33, 1, 0.68, 1], // easeOutExpo approximation as cubic-bezier
    });
    return controls.stop;
  }, [inView, mv, target]);

  return <motion.span>{display}</motion.span>;
}
