"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

const STAT_REGEX = /^([^0-9]*)([0-9]+(?:[.,][0-9]+)?)(.*)$/;

function formatNumber(
  value: number,
  decimalPlaces: number,
  hasCommas: boolean
): string {
  const fixed = value.toFixed(decimalPlaces);
  if (!hasCommas) {
    return fixed;
  }
  const [intPart, decPart] = fixed.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart ? `${withCommas}.${decPart}` : withCommas;
}

export function useStatCounter(stat: string | undefined, active: boolean) {
  const hasAnimated = useRef(false);
  const [displayValue, setDisplayValue] = useState(stat ?? "");

  const match = stat?.match(STAT_REGEX);
  const prefix = match?.[1] ?? "";
  const rawNumber = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";

  const hasCommas = rawNumber.includes(",");
  const cleanNumber = rawNumber.replace(/,/g, "");
  const target = Number.parseFloat(cleanNumber) || 0;
  const decimalPlaces = cleanNumber.includes(".")
    ? cleanNumber.split(".")[1].length
    : 0;

  const canAnimate = Boolean(match && target > 0);

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (!canAnimate) {
      setDisplayValue(stat ?? "");
      return;
    }

    const unsubscribe = spring.on("change", (v: number) => {
      setDisplayValue(
        `${prefix}${formatNumber(v, decimalPlaces, hasCommas)}${suffix}`
      );
    });

    return unsubscribe;
  }, [spring, canAnimate, prefix, suffix, decimalPlaces, hasCommas, stat]);

  useEffect(() => {
    if (active && canAnimate && !hasAnimated.current) {
      hasAnimated.current = true;
      motionValue.set(target);
    }
  }, [active, canAnimate, motionValue, target]);

  return displayValue;
}
