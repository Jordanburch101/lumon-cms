import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { statsData } from "./bento-data";

export function StatsCard() {
  return (
    <div className="flex h-full items-center overflow-hidden rounded-lg bg-foreground px-6 text-background">
      <div className="grid w-full grid-cols-3 divide-x divide-background/10">
        {statsData.map((stat) => (
          <div
            className="flex items-center justify-center gap-3 px-4"
            key={stat.label}
          >
            <div>
              <span className="font-semibold text-lg tabular-nums">
                {stat.value}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-background/50 uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="flex items-center gap-0.5 text-[11px] text-emerald-400">
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
