"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PageStatus, SnapPosition } from "./admin-bar-data";
import { AdminBarStatusCard } from "./admin-bar-status-card";

interface AdminBarStatusDotProps {
  collapsed: boolean;
  position: SnapPosition;
  status: PageStatus;
}

export function AdminBarStatusDot({
  collapsed,
  position,
  status,
}: AdminBarStatusDotProps) {
  const [open, setOpen] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTop = position.startsWith("top");

  const show = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setOpen(true);
  }, []);

  const scheduleHide = useCallback(() => {
    leaveTimeout.current = setTimeout(() => setOpen(false), 100);
  }, []);

  const hide = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setOpen(false);
  }, []);

  // Close on Escape
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

  // Cleanup pending timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeout.current) {
        clearTimeout(leaveTimeout.current);
      }
    };
  }, []);

  return (
    <>
      {/* Dot badge */}
      <button
        aria-label="Page status"
        className="absolute -top-[2px] -right-[2px] appearance-none border-0 bg-transparent p-0"
        onBlur={collapsed ? undefined : scheduleHide}
        onClick={collapsed ? undefined : () => setOpen((prev) => !prev)}
        onFocus={collapsed ? undefined : show}
        onMouseEnter={collapsed ? undefined : show}
        onMouseLeave={collapsed ? undefined : scheduleHide}
        tabIndex={collapsed ? -1 : 0}
        type="button"
      >
        {/* Invisible hit area */}
        {!collapsed && <div className="absolute -inset-[6px] rounded-full" />}
        <motion.div
          animate={{ scale: 1, opacity: 1 }}
          className="h-[7px] w-[7px] rounded-full border-[1.5px] border-white/90 dark:border-black/50"
          initial={{ scale: 0, opacity: 0 }}
          style={{
            backgroundColor: status.color,
            boxShadow: `0 0 4px ${status.color}66`,
            transition: "background-color 0.3s",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        />
      </button>

      {/* Hover card — expanded state only */}
      {!collapsed && (
        <AnimatePresence>
          {open && (
            <motion.div
              animate={{ y: 0 }}
              className="absolute left-0 z-[10]"
              exit={{ y: isTop ? -4 : 4, transition: { duration: 0.1 } }}
              initial={{ y: isTop ? -4 : 4 }}
              onMouseEnter={show}
              onMouseLeave={scheduleHide}
              style={{
                [isTop ? "top" : "bottom"]: "100%",
                [isTop ? "marginTop" : "marginBottom"]: "8px",
              }}
              transition={{ duration: 0.15 }}
            >
              <AdminBarStatusCard animate status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
