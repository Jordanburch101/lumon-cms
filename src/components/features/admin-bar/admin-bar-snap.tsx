"use client";

import { motion } from "motion/react";
import { cn } from "@/core/lib/utils";
import { SNAP_POSITIONS, type SnapPosition } from "./admin-bar-data";

interface AdminBarSnapProps {
  activeZone: SnapPosition | null;
}

export function AdminBarSnap({ activeZone }: AdminBarSnapProps) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed inset-0 z-[9998] bg-black/40"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {(
        Object.entries(SNAP_POSITIONS) as [
          SnapPosition,
          (typeof SNAP_POSITIONS)[SnapPosition],
        ][]
      ).map(([position, { className, label }]) => (
        <div
          className={cn(
            "fixed rounded-xl border px-6 py-2 text-[9px] uppercase tracking-[0.15em] transition-all duration-150",
            className,
            activeZone === position
              ? "border-white/60 bg-white/20 text-white shadow-[0_0_24px_rgba(255,255,255,0.15)]"
              : "border-white/30 bg-white/10 text-white/60"
          )}
          key={position}
        >
          {label}
        </div>
      ))}
    </motion.div>
  );
}
