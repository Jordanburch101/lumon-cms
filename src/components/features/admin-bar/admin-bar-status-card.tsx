"use client";

import type { PageStatus } from "./admin-bar-data";
import { formatRelativeTime } from "./admin-bar-data";

interface AdminBarStatusCardProps {
  status: PageStatus;
}

export function AdminBarStatusCard({ status }: AdminBarStatusCardProps) {
  return (
    <div className="relative min-w-[200px] rounded-[12px] p-1.5 shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_4px_16px_rgba(0,0,0,0.08),0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.12),0_8px_32px_rgba(0,0,0,0.08)]">
      {/* Liquid glass layers */}
      <div className="admin-glass-effect rounded-[inherit]" />
      <div className="admin-glass-tint rounded-[inherit]" />
      <div className="admin-glass-shine rounded-[inherit]" />

      <div className="relative z-[3] space-y-2 px-2.5 py-2">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: status.color,
              boxShadow: `0 0 6px ${status.color}66`,
            }}
          />
          <span className="font-medium text-black/90 text-xs dark:text-white">
            {status.label}
          </span>
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

        {/* Timestamps */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-black/50 dark:text-white/40">
              Last published
            </span>
            <span className="text-[11px] text-black/70 dark:text-white/60">
              {status.lastPublished
                ? formatRelativeTime(status.lastPublished)
                : "Never published"}
            </span>
          </div>

          {status.lastEdited && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-black/50 dark:text-white/40">
                Last edited
              </span>
              <span className="text-[11px] text-black/70 dark:text-white/60">
                {formatRelativeTime(status.lastEdited)}
              </span>
            </div>
          )}

          {status.createdAt && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] text-black/50 dark:text-white/40">
                Created
              </span>
              <span className="text-[11px] text-black/70 dark:text-white/60">
                {formatRelativeTime(status.createdAt)}
              </span>
            </div>
          )}
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />

        {/* Version count + history link */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] text-black/50 dark:text-white/40">
            Versions
          </span>
          <a
            className="text-[11px] text-black/70 transition-colors hover:text-black/90 dark:text-white/60 dark:hover:text-white/80"
            href={`/admin/collections/${status.collection}/${status.pageId}/versions`}
          >
            {status.versionCount > 0 ? (
              <>
                {status.versionCount}
                <span className="ml-1 text-black/40 dark:text-white/30">
                  \u2192
                </span>
              </>
            ) : (
              "\u2014"
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
