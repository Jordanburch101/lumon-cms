"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/core/lib/utils";
import type { SnapPosition } from "./admin-bar-data";

// --- Glass Card Shell ---

interface AdminBarGlassCardProps {
  animate?: boolean;
  children: ReactNode;
  className?: string;
}

/** Shared glass card container used by all admin bar hover cards. */
export function AdminBarGlassCard({
  animate: shouldAnimate = false,
  children,
  className,
}: AdminBarGlassCardProps) {
  return (
    <div
      className={cn(
        "relative min-w-[200px] rounded-[12px] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* Backdrop blur — no opacity animation (breaks compositing) */}
      <div className="admin-glass-effect rounded-[inherit]" />
      {/* Tint + shine fade in separately */}
      <motion.div
        animate={{ opacity: 1 }}
        className="admin-glass-tint rounded-[inherit]"
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        animate={{ opacity: 1 }}
        className="admin-glass-shine rounded-[inherit]"
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        transition={{ duration: 0.15 }}
      />

      <motion.div
        animate={{ opacity: 1 }}
        className="relative z-[3] space-y-2 px-2.5 py-2"
        initial={shouldAnimate ? { opacity: 0 } : undefined}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// --- Hover Card Trigger ---

interface AdminBarHoverCardProps {
  children: ReactNode;
  content: ReactNode;
  position: SnapPosition;
}

/** Hover-triggered card that appears above or below the trigger, matching the status dot pattern. */
export function AdminBarHoverCard({
  children,
  content,
  position,
}: AdminBarHoverCardProps) {
  const isTop = position.startsWith("top");
  const [open, setOpen] = useState(false);
  const leaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (leaveRef.current) {
      clearTimeout(leaveRef.current);
      leaveRef.current = null;
    }
    setOpen(true);
  }, []);

  const scheduleHide = useCallback(() => {
    leaveRef.current = setTimeout(() => setOpen(false), 100);
  }, []);

  const hide = useCallback(() => {
    if (leaveRef.current) {
      clearTimeout(leaveRef.current);
      leaveRef.current = null;
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hide();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide]);

  useEffect(() => {
    return () => {
      if (leaveRef.current) {
        clearTimeout(leaveRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: tooltip trigger wraps interactive children */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: tooltip trigger wraps interactive children */}
      <div onMouseEnter={show} onMouseLeave={scheduleHide}>
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              "absolute left-0 z-[10]",
              isTop ? "top-full mt-2" : "bottom-full mb-2"
            )}
            exit={{
              y: isTop ? -4 : 4,
              opacity: 0,
              transition: { duration: 0.1 },
            }}
            initial={{ y: isTop ? -4 : 4, opacity: 0 }}
            onMouseEnter={show}
            onMouseLeave={scheduleHide}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
