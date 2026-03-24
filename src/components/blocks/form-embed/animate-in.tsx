"use client";

import { motion, useInView } from "motion/react";
import { type ReactNode, useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

interface AnimateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimateIn({ children, className, delay = 0 }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      animate={inView ? { opacity: 1, y: 0 } : {}}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      ref={ref}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
