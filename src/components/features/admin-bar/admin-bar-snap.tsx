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
      className="pointer-events-none fixed inset-0 z-[9998]"
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
            "fixed rounded-xl border border-dashed px-6 py-2 text-[9px] uppercase tracking-[0.15em] transition-colors duration-150",
            className,
            activeZone === position
              ? "border-foreground/20 bg-foreground/[0.02] text-foreground/35"
              : "border-border/12 text-muted-foreground/20"
          )}
          key={position}
        >
          {label}
        </div>
      ))}
    </motion.div>
  );
}
