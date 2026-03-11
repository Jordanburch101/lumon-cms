"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";
import { AdminBarActions } from "./admin-bar-actions";
import {
  type AdminBarState,
  type AdminUser,
  getSlugFromPathname,
  hasCookie,
  loadBarState,
  type PageContext,
  SNAP_POSITIONS,
  type SnapPosition,
  saveBarState,
} from "./admin-bar-data";
import { AdminBarSnap } from "./admin-bar-snap";
import { AdminBarToggle } from "./admin-bar-toggle";

function findNearestSnap(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number
): SnapPosition {
  const zones: { position: SnapPosition; x: number; y: number }[] = [
    { position: "top-left", x: 16, y: 16 },
    { position: "top-center", x: viewportWidth / 2, y: 16 },
    { position: "top-right", x: viewportWidth - 16, y: 16 },
    { position: "bottom-left", x: 16, y: viewportHeight - 16 },
    { position: "bottom-center", x: viewportWidth / 2, y: viewportHeight - 16 },
    { position: "bottom-right", x: viewportWidth - 16, y: viewportHeight - 16 },
  ];

  let nearest = zones[0];
  let minDist = Number.POSITIVE_INFINITY;

  for (const zone of zones) {
    const dist = Math.hypot(zone.x - x, zone.y - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = zone;
    }
  }

  return nearest.position;
}

export function AdminBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [page, setPage] = useState<PageContext | null>(null);
  const [barState, setBarState] = useState<AdminBarState>(loadBarState);
  const [isDraft, setIsDraft] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<SnapPosition | null>(null);
  const [toggling, setToggling] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Auth check
  useEffect(() => {
    if (!hasCookie("payload-token")) {
      return;
    }

    fetch("/api/users/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
          });
        }
      })
      .catch(() => {
        /* silent */
      });
  }, []);

  // Page context — refetch on pathname change (SPA navigation)
  useEffect(() => {
    if (!user) {
      return;
    }

    setPage(null); // reset while fetching
    const slug = getSlugFromPathname(pathname);
    fetch(
      `/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&select[id]=true&select[slug]=true`,
      { credentials: "include" }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const doc = data?.docs?.[0];
        if (doc) {
          setPage({ id: doc.id, slug: doc.slug });
        }
      })
      .catch(() => {
        /* silent */
      });
  }, [user, pathname]);

  // Read draft mode state from toggle API (HttpOnly cookie can't be read client-side)
  useEffect(() => {
    if (!user) {
      return;
    }

    fetch("/api/draft/toggle", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsDraft(data.enabled);
        }
      })
      .catch(() => {
        /* silent */
      });
  }, [user]);

  // Persist state changes
  const updateBarState = useCallback((updates: Partial<AdminBarState>) => {
    setBarState((prev) => {
      const next = { ...prev, ...updates };
      saveBarState(next);
      return next;
    });
  }, []);

  // Toggle draft mode
  const handleToggleDraft = useCallback(async () => {
    if (toggling) {
      return;
    }
    setToggling(true);
    try {
      const res = await fetch("/api/draft/toggle", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        window.location.reload();
      } else if (res.status === 401) {
        setUser(null);
      }
    } catch {
      // Silent fail — convenience tool
    } finally {
      setToggling(false);
    }
  }, [toggling]);

  // Drag handlers
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDrag = useCallback(() => {
    if (!barRef.current) {
      return;
    }
    const rect = barRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nearest = findNearestSnap(
      centerX,
      centerY,
      window.innerWidth,
      window.innerHeight
    );
    setHoveredZone(nearest);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (hoveredZone) {
      updateBarState({ position: hoveredZone });
    }
    setIsDragging(false);
    setHoveredZone(null);
    dragX.set(0);
    dragY.set(0);
  }, [hoveredZone, updateBarState, dragX, dragY]);

  if (!user) {
    return null;
  }

  const positionClass = SNAP_POSITIONS[barState.position].className;

  return (
    <>
      <AnimatePresence>
        {isDragging && <AdminBarSnap activeZone={hoveredZone} />}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: 1 }}
        className={cn("fixed z-[9999]", positionClass)}
        drag
        dragElastic={0}
        dragMomentum={false}
        initial={{ opacity: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        ref={barRef}
        style={{ x: dragX, y: dragY }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {barState.collapsed ? (
            <motion.button
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-border/10 bg-card/92 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-colors hover:bg-card"
              exit={{ scale: 0.8, opacity: 0 }}
              initial={{ scale: 0.8, opacity: 0 }}
              key="collapsed"
              layout
              onClick={() => updateBarState({ collapsed: false })}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="text-foreground/70"
                fill="currentColor"
                height="15"
                viewBox="0 0 24 24"
                width="15"
              >
                <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" />
              </svg>
            </motion.button>
          ) : (
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex items-center gap-0.5 rounded-xl border border-border/10 bg-card/92 py-1.5 pr-1.5 pl-3.5 backdrop-blur-xl",
                isDragging
                  ? "shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
                  : "shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              )}
              exit={{ scale: 0.9, opacity: 0 }}
              initial={{ scale: 0.9, opacity: 0 }}
              key="expanded"
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {/* Drag handle area */}
              <div className="flex cursor-grab items-center gap-2 border-border/10 border-r pr-2 active:cursor-grabbing">
                <svg
                  aria-hidden="true"
                  className="text-foreground/70"
                  fill="currentColor"
                  height="14"
                  viewBox="0 0 24 24"
                  width="14"
                >
                  <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" />
                </svg>
                <div className="flex flex-col gap-[3px] opacity-25">
                  <div className="flex gap-[3px]">
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                  </div>
                  <div className="flex gap-[3px]">
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                  </div>
                  <div className="flex gap-[3px]">
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                    <div className="h-[2px] w-[2px] rounded-full bg-foreground" />
                  </div>
                </div>
              </div>

              {/* Actions: Edit Page + Collections */}
              <AdminBarActions
                page={page}
                position={barState.position}
                user={user}
              />

              {/* Divider */}
              <div className="mx-1 h-5 w-px bg-border/10" />

              {/* Draft toggle */}
              <AdminBarToggle
                disabled={toggling}
                isDraft={isDraft}
                onToggle={handleToggleDraft}
              />

              {/* Divider */}
              <div className="mx-1 h-5 w-px bg-border/10" />

              {/* Collapse */}
              <button
                className="flex h-7 w-7 items-center justify-center rounded-lg text-foreground/30 transition-colors hover:bg-white/[0.05] hover:text-foreground/50"
                onClick={() => updateBarState({ collapsed: true })}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="text-current"
                  fill="none"
                  height="14"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="14"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
