"use client";

import type { PageStatus } from "./admin-bar-data";
import { formatRelativeTime } from "./admin-bar-data";
import { AdminBarGlassCard } from "./admin-bar-glass-card";

interface AdminBarStatusCardProps {
  animate?: boolean;
  status: PageStatus;
}

export function AdminBarStatusCard({
  animate: shouldAnimate = false,
  status,
}: AdminBarStatusCardProps) {
  return (
    <AdminBarGlassCard animate={shouldAnimate}>
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
        {status.versionCount > 0 ? (
          <a
            className="text-[11px] text-black/70 transition-colors hover:text-black/90 dark:text-white/60 dark:hover:text-white/80"
            href={`/admin/collections/${status.collection}/${status.pageId}/versions`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {status.versionCount}
            <span className="ml-1 text-black/40 dark:text-white/30">
              {"\u2192"}
            </span>
          </a>
        ) : (
          <span className="text-[11px] text-black/70 dark:text-white/60">
            {"\u2014"}
          </span>
        )}
      </div>
    </AdminBarGlassCard>
  );
}
