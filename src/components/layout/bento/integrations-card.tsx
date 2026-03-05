"use client";

import { motion, useInView } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

const integrations = [
  { name: "Next.js", icon: "/icons/nextjs.svg" },
  { name: "Tailwind", icon: "/icons/tailwind.svg" },
  { name: "Payload", icon: "/icons/payload.svg" },
  { name: "React", icon: "/icons/react.svg" },
  { name: "Vercel", icon: "/icons/vercel.svg" },
  { name: "TypeScript", icon: "/icons/typescript.svg" },
];

export function IntegrationsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div
      className="flex h-full items-center gap-4 overflow-hidden rounded-xl border border-border/50 bg-background px-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]"
      ref={ref}
    >
      <span className="hidden shrink-0 text-[10px] text-muted-foreground/60 uppercase tracking-wider sm:block">
        Built with
      </span>
      <div className="flex flex-1 items-center justify-around gap-2">
        {integrations.map((item, i) => (
          <motion.div
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: 6 }}
            key={item.name}
            transition={{
              delay: 0.05 + i * 0.08,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <Image
              alt={item.name}
              className="dark:invert"
              height={14}
              src={item.icon}
              width={14}
            />
            <span className="text-[11px] text-muted-foreground">
              {item.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
