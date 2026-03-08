"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MdrScreen } from "./mdr-screen";
import { CRT } from "./mdr-terminal-data";

const EASE = [0.16, 1, 0.3, 1] as const;

export function MdrTerminal() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      className="w-full py-24 lg:py-32"
      data-navbar-contrast="light"
      ref={sectionRef}
      style={{ backgroundColor: CRT.bg }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* Section header */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-10 text-center lg:mb-16"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span
            className="mb-4 block font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: CRT.textDim }}
          >
            Macro Data Refinement
          </span>
          <h2
            className="font-semibold text-3xl leading-tight sm:text-4xl"
            style={{ color: CRT.textBright }}
          >
            Experience the work
          </h2>
          <p className="mt-3 text-base" style={{ color: CRT.textDim }}>
            Your outie has approved this session.
          </p>
        </motion.div>

        {/* CRT Monitor */}
        <motion.div
          animate={inView ? { opacity: 1, y: 0 } : {}}
          initial={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          <MdrScreen />
        </motion.div>
      </div>
    </section>
  );
}
