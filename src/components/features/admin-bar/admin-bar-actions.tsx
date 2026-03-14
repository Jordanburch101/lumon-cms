"use client";

import {
  Cancel01Icon,
  GridIcon,
  Logout03Icon,
  PencilEdit02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/core/lib/utils";
import { SaveControls } from "../frontend-editor/save-controls";
import { useEditMode } from "../frontend-editor/use-edit-mode";
import type { AdminUser, PageContext, SnapPosition } from "./admin-bar-data";

interface AdminBarActionsProps {
  onOpenPalette: () => void;
  page: PageContext | null;
  position: SnapPosition;
  user: AdminUser;
}

export function AdminBarActions({
  onOpenPalette,
  page,
  position,
  user,
}: AdminBarActionsProps) {
  const isTop = position.startsWith("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLElement>(null);
  const editMode = useEditMode();

  const initial = (user.name?.[0] || user.email[0]).toUpperCase();

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Close menu on Escape key or click outside
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen, closeMenu]);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (menuOpen) {
      requestAnimationFrame(() => firstItemRef.current?.focus());
    }
  }, [menuOpen]);

  const handleEnterEditMode = useCallback(async () => {
    if (!(page && editMode)) {
      return;
    }

    try {
      // Ensure draft mode is enabled
      const draftRes = await fetch("/api/draft/toggle", {
        credentials: "include",
      });
      if (draftRes.ok) {
        const draftData = await draftRes.json();
        if (!draftData.enabled) {
          await fetch("/api/draft/toggle", {
            method: "POST",
            credentials: "include",
          });
        }
      }

      // Fetch full page data with blocks
      const res = await fetch(`/api/pages/${page.id}?draft=true&depth=2`, {
        credentials: "include",
      });
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      editMode.actions.enter(page.id, data.layout ?? []);
    } catch {
      // Silent fail — edit mode is a convenience feature
    }
  }, [page, editMode]);

  const handleExit = useCallback(() => {
    editMode?.actions.exit();
  }, [editMode]);

  // Edit mode active — show save controls instead of normal actions
  if (editMode?.state.active) {
    const dirtyFields = editMode.state.dirtyFields;
    const dirtyCount = dirtyFields.size;
    const dirtyEntries = [...dirtyFields.entries()];

    return (
      <div className="flex items-center gap-2">
        {dirtyCount > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                {dirtyCount} {dirtyCount === 1 ? "change" : "changes"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-80 overflow-hidden border-none bg-transparent p-0 shadow-none"
              sideOffset={8}
            >
              <div className="relative min-w-[200px] rounded-[12px] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]">
                <div className="admin-glass-effect rounded-[inherit]" />
                <div className="admin-glass-tint rounded-[inherit]" />
                <div className="admin-glass-shine rounded-[inherit]" />

                <div className="relative z-[3] px-2.5 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full bg-amber-400"
                      style={{ boxShadow: "0 0 6px rgba(251,191,36,0.4)" }}
                    />
                    <span className="font-medium text-black/90 text-xs dark:text-white">
                      {dirtyCount} unsaved{" "}
                      {dirtyCount === 1 ? "change" : "changes"}
                    </span>
                  </div>

                  <div className="my-2 h-px bg-black/[0.06] dark:bg-white/[0.06]" />

                  <div className="max-h-48 space-y-0.5 overflow-y-auto">
                    {dirtyEntries.map(([key, entry]) => (
                      <div
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                        key={key}
                      >
                        <span className="truncate text-[11px] text-black/50 dark:text-white/40">
                          {entry.label}
                        </span>
                        {key !== "__structure" && (
                          <button
                            className="shrink-0 rounded p-0.5 text-black/40 transition-colors hover:text-black/80 dark:text-white/30 dark:hover:text-white/70"
                            onClick={() =>
                              editMode.actions.revertField(key)
                            }
                            title="Revert this change"
                            type="button"
                          >
                            <svg
                              fill="none"
                              height="12"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              width="12"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Editing
          </span>
        )}
        <SaveControls />
        <Button
          className="h-7 w-7"
          onClick={handleExit}
          size="icon"
          variant="ghost"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={14} />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Edit Page */}
      {page ? (
        <motion.button
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-black/80 text-xs transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white/90"
          onClick={handleEnterEditMode}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          type="button"
          whileHover={{ scale: 1.02 }}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          <span>{page.label}</span>
        </motion.button>
      ) : (
        <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-black/35 text-xs dark:text-white/25">
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          <span>Edit</span>
        </span>
      )}

      {/* Collections */}
      <motion.a
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-black/80 text-xs transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white/90"
        href="/admin/collections"
        rel="noopener noreferrer"
        target="_blank"
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.02 }}
      >
        <HugeiconsIcon icon={GridIcon} size={14} />
        <span>Collections</span>
      </motion.a>

      {/* Palette trigger */}
      <button
        className="rounded-sm p-1 text-black/60 transition-colors hover:text-black/80 dark:text-white/70 dark:hover:text-white"
        onClick={onOpenPalette}
        title="Search (⌘⇧K)"
        type="button"
      >
        <HugeiconsIcon icon={Search01Icon} size={14} />
      </button>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <motion.button
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label="User menu"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          onClick={() => setMenuOpen((prev) => !prev)}
          ref={triggerRef}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          type="button"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/80 font-semibold text-[10px] text-white dark:bg-white/20 dark:text-white/90">
            {initial}
          </div>
        </motion.button>

        {menuOpen && (
          <div
            className={cn(
              "absolute right-0 min-w-[180px] rounded-[12px] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]",
              isTop ? "top-full mt-2" : "bottom-full mb-2"
            )}
            role="menu"
          >
            {/* Liquid glass layers */}
            <div className="admin-glass-effect rounded-[inherit]" />
            <div className="admin-glass-tint rounded-[inherit]" />
            <div className="admin-glass-shine rounded-[inherit]" />

            <div className="relative z-[3] border-black/[0.06] border-b px-2.5 py-2 dark:border-white/[0.06]">
              <p className="font-medium text-black/90 text-xs dark:text-white">
                {user.name || "Admin"}
              </p>
              <p className="text-[11px] text-black/60 dark:text-white/50">
                {user.email}
              </p>
            </div>

            {/* Open in Admin */}
            {page && (
              <a
                className="relative z-[3] mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-black/60 text-xs transition-colors hover:bg-black/[0.04] hover:text-black/90 dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
                href={`/admin/collections/${page.collection}/${page.id}`}
                onClick={() => setMenuOpen(false)}
                ref={firstItemRef as React.RefObject<HTMLAnchorElement | null>}
                rel="noopener noreferrer"
                role="menuitem"
                target="_blank"
              >
                <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                Open in Admin
              </a>
            )}

            <button
              className="relative z-[3] mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-black/60 text-xs transition-colors hover:bg-black/[0.04] hover:text-black/90 dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
              onClick={async () => {
                setMenuOpen(false);
                try {
                  await fetch("/api/users/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                } catch {
                  /* silent */
                }
                window.location.reload();
              }}
              ref={
                page
                  ? undefined
                  : (firstItemRef as React.RefObject<HTMLButtonElement | null>)
              }
              role="menuitem"
              type="button"
            >
              <HugeiconsIcon icon={Logout03Icon} size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
