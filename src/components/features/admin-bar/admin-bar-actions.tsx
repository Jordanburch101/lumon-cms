"use client";

import {
  GridIcon,
  Logout03Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);

  return (
    <>
      {/* Edit Page */}
      {page ? (
        <a
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-foreground/70 text-xs transition-colors hover:bg-white/[0.05]"
          href={`/admin/collections/pages/${page.id}`}
        >
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          <span>Edit Page</span>
        </a>
      ) : (
        <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground/40 text-xs">
          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
          <span>Edit Page</span>
        </span>
      )}

      {/* Collections */}
      <a
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-foreground/70 text-xs transition-colors hover:bg-white/[0.05]"
        href="/admin/collections"
      >
        <HugeiconsIcon icon={GridIcon} size={14} />
        <span>Collections</span>
      </a>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          aria-label="User menu"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-white/[0.05]"
          onBlur={(e) => {
            if (!menuRef.current?.contains(e.relatedTarget)) {
              setMenuOpen(false);
            }
          }}
          onClick={() => setMenuOpen((prev) => !prev)}
          type="button"
        >
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/[0.08] font-semibold text-[10px] text-muted-foreground">
            {initial}
          </div>
        </button>

        {menuOpen && (
          <div
            className={cn(
              "absolute right-0 min-w-[180px] rounded-lg border border-border/10 bg-card/95 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl",
              isTop ? "top-full mt-2" : "bottom-full mb-2"
            )}
          >
            <div className="border-border/10 border-b px-2.5 py-2">
              <p className="font-medium text-foreground text-xs">
                {user.name || "Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground">{user.email}</p>
            </div>
            <button
              className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-white/[0.05] hover:text-foreground"
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
