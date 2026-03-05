"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";

const themes = [
  {
    name: "Sky",
    bg: "bg-white",
    accent: "bg-sky-400",
    muted: "bg-sky-100",
    mutedLight: "bg-sky-50",
    btn: "bg-sky-400",
    btnMuted: "bg-sky-100",
    ring: "ring-sky-100",
  },
  {
    name: "Rose",
    bg: "bg-white",
    accent: "bg-rose-400",
    muted: "bg-rose-100",
    mutedLight: "bg-rose-50",
    btn: "bg-rose-400",
    btnMuted: "bg-rose-100",
    ring: "ring-rose-100",
  },
  {
    name: "Mint",
    bg: "bg-white",
    accent: "bg-emerald-400",
    muted: "bg-emerald-100",
    mutedLight: "bg-emerald-50",
    btn: "bg-emerald-400",
    btnMuted: "bg-emerald-100",
    ring: "ring-emerald-100",
  },
  {
    name: "Amber",
    bg: "bg-white",
    accent: "bg-amber-400",
    muted: "bg-amber-100",
    mutedLight: "bg-amber-50",
    btn: "bg-amber-400",
    btnMuted: "bg-amber-100",
    ring: "ring-amber-100",
  },
  {
    name: "Violet",
    bg: "bg-white",
    accent: "bg-violet-400",
    muted: "bg-violet-100",
    mutedLight: "bg-violet-50",
    btn: "bg-violet-400",
    btnMuted: "bg-violet-100",
    ring: "ring-violet-100",
  },
];

// Landing page wireframe — nav, hero, feature grid, CTA
function MiniPreviewA({ theme }: { theme: (typeof themes)[number] }) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-1.5 overflow-hidden rounded-md p-2 ring-1",
        theme.bg,
        theme.ring
      )}
    >
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <div className={cn("h-1 w-5 rounded-sm", theme.accent)} />
        <div className="flex gap-1">
          <div className={cn("h-0.5 w-3 rounded-full", theme.muted)} />
          <div className={cn("h-0.5 w-3 rounded-full", theme.muted)} />
          <div className={cn("h-1 w-4 rounded-sm", theme.btn)} />
        </div>
      </div>

      {/* Hero — centered heading + subtext + CTA */}
      <div
        className={cn(
          "flex flex-col items-center gap-1 rounded px-2 py-2",
          theme.mutedLight
        )}
      >
        <div className={cn("h-1 w-10 rounded-full", theme.muted)} />
        <div className={cn("h-0.5 w-8 rounded-full", theme.muted)} />
        <div className="flex gap-1 pt-0.5">
          <div className={cn("h-1 w-5 rounded-sm", theme.btn)} />
          <div className={cn("h-1 w-5 rounded-sm", theme.btnMuted)} />
        </div>
      </div>

      {/* 3-col feature cards */}
      <div className="flex gap-1">
        {[0, 1, 2].map((k) => (
          <div className="flex flex-1 flex-col gap-0.5 rounded p-1" key={k}>
            <div className={cn("h-1.5 w-1.5 rounded-sm", theme.accent)} />
            <div className={cn("h-0.5 w-full rounded-full", theme.muted)} />
            <div className={cn("h-0.5 w-3/4 rounded-full", theme.mutedLight)} />
          </div>
        ))}
      </div>

      {/* Testimonial / quote block */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center gap-0.5 rounded px-2 py-1",
          theme.mutedLight
        )}
      >
        <div className={cn("h-0.5 w-full rounded-full", theme.muted)} />
        <div className={cn("h-0.5 w-4/5 rounded-full", theme.muted)} />
        <div className="flex items-center gap-1 pt-0.5">
          <div className={cn("h-1.5 w-1.5 rounded-full", theme.accent)} />
          <div className={cn("h-0.5 w-6 rounded-full", theme.muted)} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className={cn("h-0.5 w-4 rounded-full", theme.mutedLight)} />
        <div className="flex gap-0.5">
          <div className={cn("h-1 w-1 rounded-full", theme.muted)} />
          <div className={cn("h-1 w-1 rounded-full", theme.muted)} />
          <div className={cn("h-1 w-1 rounded-full", theme.muted)} />
        </div>
      </div>
    </div>
  );
}

// Dashboard wireframe — sidebar, stats, chart bars, table rows
function MiniPreviewB({ theme }: { theme: (typeof themes)[number] }) {
  return (
    <div
      className={cn(
        "flex flex-1 overflow-hidden rounded-md ring-1",
        theme.bg,
        theme.ring
      )}
    >
      {/* Mini sidebar */}
      <div
        className={cn(
          "flex w-5 shrink-0 flex-col items-center gap-1.5 py-2",
          theme.mutedLight
        )}
      >
        <div className={cn("h-1.5 w-1.5 rounded-sm", theme.accent)} />
        <div className={cn("h-1 w-1 rounded-sm", theme.muted)} />
        <div className={cn("h-1 w-1 rounded-sm", theme.muted)} />
        <div className={cn("h-1 w-1 rounded-sm", theme.muted)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className={cn("h-0.5 w-6 rounded-full", theme.muted)} />
          <div className={cn("h-1.5 w-1.5 rounded-full", theme.accent)} />
        </div>

        {/* Stat cards row */}
        <div className="flex gap-1">
          {[0, 1].map((k) => (
            <div className={cn("flex-1 rounded p-1", theme.mutedLight)} key={k}>
              <div
                className={cn("mb-0.5 h-1.5 w-3 rounded-sm", theme.accent)}
              />
              <div className={cn("h-0.5 w-full rounded-full", theme.muted)} />
            </div>
          ))}
        </div>

        {/* Content rows */}
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          {[0, 1, 2].map((k) => (
            <div className="flex items-center gap-1" key={k}>
              <div
                className={cn("h-1.5 w-1.5 shrink-0 rounded-sm", theme.accent)}
              />
              <div className={cn("h-0.5 flex-1 rounded-full", theme.muted)} />
              <div className={cn("h-0.5 w-3 rounded-full", theme.mutedLight)} />
            </div>
          ))}
        </div>

        {/* Table rows */}
        <div className="flex flex-col gap-0.5">
          {[0, 1, 2].map((k) => (
            <div className="flex items-center gap-1" key={k}>
              <div
                className={cn(
                  "h-0.5 flex-1 rounded-full",
                  k === 0 ? theme.muted : theme.mutedLight
                )}
              />
              <div className={cn("h-0.5 w-3 rounded-full", theme.mutedLight)} />
              <div
                className={cn(
                  "h-1 w-2.5 rounded-sm",
                  k === 0 ? theme.btn : theme.btnMuted
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % themes.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [inView]);

  const current = themes[index];
  const next = themes[(index + 1) % themes.length];

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg bg-background p-4"
      ref={ref}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
          Theming
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            className="text-[10px] text-muted-foreground/60 tabular-nums"
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            key={current.name}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {current.name}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex min-h-0 flex-1 gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex flex-1"
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            key={`left-${index}`}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <MiniPreviewA theme={current} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            className="flex flex-1"
            exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            initial={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            key={`right-${(index + 1) % themes.length}`}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.08,
            }}
          >
            <MiniPreviewB theme={next} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
