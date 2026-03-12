"use client";

import {
  GridIcon,
  Logout03Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";
import type { AdminUser, PageContext, SnapPosition } from "./admin-bar-data";

interface AdminBarActionsProps {
  page: PageContext | null;
  position: SnapPosition;
  user: AdminUser;
}

export function AdminBarActions({
  user,
  page,
  position,
}: AdminBarActionsProps) {
  const isTop = position.startsWith("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = (user.name?.[0] || user.email[0]).toUpperCase();

  // Close menu on Escape key or click outside
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
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
  }, [menuOpen]);

  return (
    <>
      {/* Edit Page */}
      {page ? (
        <motion.a
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-black/80 text-xs transition-colors hover:bg-black/[0.04] hover:text-black dark:text-white/70 dark:hover:bg-white/[0.06] dark:hover:text-white/90"
          href={`/admin/collections/${page.collection}/${page.id}`}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          whileHover={{ scale: 1.02 }}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          <span>{page.label}</span>
        </motion.a>
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
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        whileHover={{ scale: 1.02 }}
      >
        <HugeiconsIcon icon={GridIcon} size={14} />
        <span>Collections</span>
      </motion.a>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <motion.button
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label="User menu"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          onClick={() => setMenuOpen((prev) => !prev)}
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
            <button
              className="relative z-[3] mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-black/60 text-xs transition-colors hover:bg-black/[0.04] hover:text-black/90 dark:text-white/50 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
              onClick={async () => {
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
