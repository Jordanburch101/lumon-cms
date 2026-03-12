"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTop = position.startsWith("top");

  const handleEnter = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setHovered(true);
  }, []);

  const handleLeave = useCallback(() => {
    leaveTimeout.current = setTimeout(() => setHovered(false), 100);
  }, []);

  return (
    <>
      {/* Dot badge */}
      <button
        aria-label="Page status"
        className="absolute -top-[2px] -right-[2px] appearance-none border-0 bg-transparent p-0"
        onClick={collapsed ? undefined : handleEnter}
        onMouseEnter={collapsed ? undefined : handleEnter}
        onMouseLeave={collapsed ? undefined : handleLeave}
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
          {hovered && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              className="absolute left-0 z-[10]"
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              initial={{ opacity: 0, scale: 0.95 }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              style={{
                [isTop ? "top" : "bottom"]: "100%",
                [isTop ? "marginTop" : "marginBottom"]: "8px",
                transformOrigin: isTop ? "top left" : "bottom left",
              }}
              transition={{ duration: 0.15 }}
            >
              <AdminBarStatusCard status={status} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
