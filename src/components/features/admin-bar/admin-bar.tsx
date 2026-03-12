"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/core/lib/utils";
import { AdminBarActions } from "./admin-bar-actions";
import {
  type AdminBarState,
  type AdminUser,
  computePageStatus,
  loadBarState,
  type PageContext,
  type PageStatus,
  type PageStatusInput,
  resolveCollection,
  SNAP_POSITIONS,
  type SnapPosition,
  saveBarState,
} from "./admin-bar-data";
import { AdminBarSnap } from "./admin-bar-snap";
import { AdminBarToggle } from "./admin-bar-toggle";

const EASE = [0.16, 1, 0.3, 1] as const;

const contentVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    y: 4,
    transition: { duration: 0.15, ease: EASE },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: EASE },
  },
};

function AdminGlassFilter() {
  return (
    <svg aria-hidden="true" style={{ display: "none" }}>
      <filter
        filterUnits="objectBoundingBox"
        height="100%"
        id="admin-glass-distortion"
        width="100%"
        x="0%"
        y="0%"
      >
        <feTurbulence
          baseFrequency="0.01 0.01"
          numOctaves={1}
          result="turbulence"
          seed={5}
          type="fractalNoise"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR amplitude={1} exponent={10} offset={0.5} type="gamma" />
          <feFuncG amplitude={0} exponent={1} offset={0} type="gamma" />
          <feFuncB amplitude={0} exponent={1} offset={0.5} type="gamma" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" result="softMap" stdDeviation={3} />
        <feSpecularLighting
          in="softMap"
          lightingColor="white"
          result="specLight"
          specularConstant={1}
          specularExponent={100}
          surfaceScale={5}
        >
          <fePointLight x={-200} y={-200} z={300} />
        </feSpecularLighting>
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={150}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

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

function LumonHexIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="text-black/80 dark:text-white/70"
      fill="currentColor"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" />
    </svg>
  );
}

export function AdminBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [page, setPage] = useState<PageContext | null>(null);
  const [barState, setBarState] = useState<AdminBarState>(loadBarState);
  const [isDraft, setIsDraft] = useState(false);
  const [_pageStatus, setPageStatus] = useState<PageStatus | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<SnapPosition | null>(null);
  const hoveredZoneRef = useRef<SnapPosition | null>(null);
  const [toggling, setToggling] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const morphRef = useRef<HTMLDivElement>(null);
  const [collapseDimensions, setCollapseDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Auth check — always attempt fetch since payload-token is HttpOnly
  useEffect(() => {
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

    const controller = new AbortController();
    const { collection, label, slug } = resolveCollection(pathname);
    fetch(
      `/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&select[id]=true&select[slug]=true&select[_status]=true&select[updatedAt]=true`,
      { credentials: "include", signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const doc = data?.docs?.[0];
        setPage(
          doc
            ? {
                id: doc.id,
                slug: doc.slug,
                collection,
                label,
                _status: doc._status,
                updatedAt: doc.updatedAt,
              }
            : null
        );
        setPageReady(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPage(null);
          setPageReady(true);
        }
      });
    return () => controller.abort();
  }, [user, pathname]);

  // Versions fetch — compute page status
  useEffect(() => {
    if (!(user && page?.id && page._status && page.updatedAt)) {
      setPageStatus(null);
      return;
    }

    const pageId = page.id;
    const pageCollection = page.collection;
    const pageCurrentStatus = page._status;
    const pageUpdatedAt = page.updatedAt;

    const controller = new AbortController();
    const opts = { credentials: "include" as const, signal: controller.signal };
    const base = `/api/${pageCollection}/${pageId}/versions`;

    Promise.all([
      fetch(
        `${base}?limit=1&sort=-updatedAt&where[version._status][equals]=draft`,
        opts
      ).then((r) => (r.ok ? r.json() : null)),
      fetch(`${base}?limit=1&sort=-updatedAt`, opts).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([draftData, allData]) => {
        const input: PageStatusInput = {
          _status: pageCurrentStatus,
          updatedAt: pageUpdatedAt,
          draftVersionCount: draftData?.totalDocs ?? 0,
          latestDraftUpdatedAt: draftData?.docs?.[0]?.updatedAt ?? null,
          totalVersionCount: allData?.totalDocs ?? 0,
        };
        setPageStatus(computePageStatus(input));
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setPageStatus(
            computePageStatus({
              _status: pageCurrentStatus,
              updatedAt: pageUpdatedAt,
              draftVersionCount: 0,
              latestDraftUpdatedAt: null,
              totalVersionCount: 0,
            })
          );
        }
      });

    return () => controller.abort();
  }, [user, page?.id, page?._status, page?.updatedAt, page?.collection]);

  // Read draft mode state from toggle API (HttpOnly cookie can't be read client-side)
  useEffect(() => {
    if (!user) {
      return;
    }

    const controller = new AbortController();
    fetch("/api/draft/toggle", {
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsDraft(data.enabled);
        }
        setDraftReady(true);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setDraftReady(true);
        }
      });
    return () => controller.abort();
  }, [user]);

  // Persist state changes
  const updateBarState = useCallback((updates: Partial<AdminBarState>) => {
    setBarState((prev) => {
      const next = { ...prev, ...updates };
      saveBarState(next);
      return next;
    });
  }, []);

  // Toggle draft mode (ref-based guard keeps callback reference stable)
  const togglingRef = useRef(false);
  const handleToggleDraft = useCallback(async () => {
    if (togglingRef.current) {
      return;
    }
    togglingRef.current = true;
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
      togglingRef.current = false;
      setToggling(false);
    }
  }, []);

  // Collapse — capture dimensions for centering wrapper
  const handleCollapse = useCallback(() => {
    if (morphRef.current) {
      setCollapseDimensions({
        width: morphRef.current.offsetWidth,
        height: morphRef.current.offsetHeight,
      });
    }
    updateBarState({ collapsed: true });
  }, [updateBarState]);

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
    if (nearest !== hoveredZoneRef.current) {
      setHoveredZone(nearest);
      hoveredZoneRef.current = nearest;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    const zone = hoveredZoneRef.current;

    setIsDragging(false);
    setHoveredZone(null);
    hoveredZoneRef.current = null;

    if (!(zone && barRef.current)) {
      animate(dragX, 0, { duration: 0.4, ease: EASE });
      animate(dragY, 0, { duration: 0.4, ease: EASE });
      return;
    }

    // FLIP: First — capture current visual position (includes drag transform)
    const first = barRef.current.getBoundingClientRect();

    // FLIP: Last — reset drag offset and update position class synchronously
    dragX.set(0);
    dragY.set(0);
    flushSync(() => {
      updateBarState({ position: zone });
    });

    // Bar is now at new CSS position with zero drag offset
    const last = barRef.current.getBoundingClientRect();

    // FLIP: Invert — offset so bar appears at its drop position
    dragX.set(first.left - last.left);
    dragY.set(first.top - last.top);

    // FLIP: Play — animate from drop position to snap target
    animate(dragX, 0, { duration: 0.4, ease: EASE });
    animate(dragY, 0, { duration: 0.4, ease: EASE });
  }, [updateBarState, dragX, dragY]);

  if (!(user && pageReady && draftReady)) {
    return null;
  }

  const positionClass = SNAP_POSITIONS[barState.position].className;

  const layoutTransition = barState.collapsed
    ? { duration: 0.3, ease: EASE, delay: 0.1 }
    : { duration: 0.4, ease: EASE };

  return (
    <>
      <AdminGlassFilter />
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
        <div
          className="flex items-center justify-center"
          style={
            collapseDimensions
              ? {
                  width: collapseDimensions.width,
                  height: collapseDimensions.height,
                }
              : undefined
          }
        >
          <motion.div
            aria-label={barState.collapsed ? "Expand admin bar" : undefined}
            className={cn(
              "relative flex items-center",
              morphing && "overflow-hidden",
              barState.collapsed
                ? "h-9 w-9 cursor-pointer justify-center rounded-[10px] transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/30 dark:hover:bg-white/[0.08]"
                : "rounded-[14px] py-1.5 pr-1.5",
              isDragging
                ? "shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_8px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.25)]"
                : "shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_20px_rgba(0,0,0,0.08),0_8px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_20px_rgba(0,0,0,0.15),0_8px_40px_rgba(0,0,0,0.1)]",
              isDraft && "ring-1 ring-amber-500/20 dark:ring-amber-400/15"
            )}
            layout
            onClick={
              barState.collapsed
                ? () => {
                    setCollapseDimensions(null);
                    updateBarState({ collapsed: false });
                  }
                : undefined
            }
            onKeyDown={
              barState.collapsed
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCollapseDimensions(null);
                      updateBarState({ collapsed: false });
                    }
                  }
                : undefined
            }
            onLayoutAnimationComplete={() => {
              setMorphing(false);
              setCollapseDimensions(null);
            }}
            onLayoutAnimationStart={() => setMorphing(true)}
            ref={morphRef}
            role={barState.collapsed ? "button" : undefined}
            tabIndex={barState.collapsed ? 0 : undefined}
            transition={{ layout: layoutTransition }}
          >
            {/* Liquid glass layers */}
            <div className="admin-glass-effect rounded-[inherit]" />
            <div className="admin-glass-tint rounded-[inherit]" />
            <div className="admin-glass-shine rounded-[inherit]" />

            {/* Hex icon — always visible, anchored via layout */}
            <motion.div
              className={cn(
                "relative z-[3] flex items-center",
                !barState.collapsed &&
                  "cursor-grab pr-2 pl-3.5 active:cursor-grabbing"
              )}
              layout
            >
              <motion.div
                animate={{ rotate: barState.collapsed ? 30 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <LumonHexIcon size={15} />
              </motion.div>
            </motion.div>

            {/* Content — staggered entry, popLayout removes from flow on exit */}
            <AnimatePresence mode="popLayout">
              {!barState.collapsed && (
                <motion.div
                  animate="visible"
                  className="relative z-[3] flex items-center gap-0.5"
                  exit="exit"
                  initial="hidden"
                  key="content"
                  variants={contentVariants}
                >
                  {/* grip dots */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center border-black/[0.08] border-r pr-2 dark:border-white/[0.08]">
                      <div className="flex flex-col gap-[3px] opacity-30">
                        <div className="flex gap-[3px]">
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                        </div>
                        <div className="flex gap-[3px]">
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                        </div>
                        <div className="flex gap-[3px]">
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                          <div className="h-[2px] w-[2px] rounded-full bg-black dark:bg-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-0.5"
                    variants={itemVariants}
                  >
                    <AdminBarActions
                      page={page}
                      position={barState.position}
                      user={user}
                    />
                  </motion.div>

                  <motion.div
                    className="flex items-center"
                    variants={itemVariants}
                  >
                    <div className="mx-1 h-5 w-px bg-black/[0.08] dark:bg-white/[0.08]" />
                    <AdminBarToggle
                      disabled={toggling}
                      isDraft={isDraft}
                      onToggle={handleToggleDraft}
                    />
                    <div className="mx-1 h-5 w-px bg-black/[0.08] dark:bg-white/[0.08]" />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      aria-label="Collapse admin bar"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-black/40 transition-colors hover:bg-black/[0.04] hover:text-black/60 dark:text-white/30 dark:hover:bg-white/[0.06] dark:hover:text-white/50"
                      onClick={handleCollapse}
                      type="button"
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
