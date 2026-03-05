import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { statsData } from "./bento-data";

export function StatsCard() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-lg bg-background p-4">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider">
        Metrics
      </span>
      <div className="flex flex-col gap-3">
        {statsData.map((stat) => (
          <div className="flex items-center justify-between" key={stat.label}>
            <span className="text-muted-foreground text-xs">{stat.label}</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tabular-nums">
                {stat.value}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <HugeiconsIcon
                  className="size-2.5"
                  icon={ArrowUp01Icon}
                  strokeWidth={2}
                />
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
