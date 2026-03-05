import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { statsData } from "./bento-data";

export function StatsCard() {
  return (
    <Card className="h-full">
      <CardContent className="flex h-full items-center">
        <div className="grid w-full grid-cols-3 divide-x">
          {statsData.map((stat) => (
            <div
              className="flex flex-col items-center gap-1 px-3"
              key={stat.label}
            >
              <span className="text-muted-foreground text-xs">
                {stat.label}
              </span>
              <span className="font-semibold text-xl tabular-nums">
                {stat.value}
              </span>
              <span className="flex items-center gap-0.5 text-emerald-600 text-xs dark:text-emerald-400">
                <HugeiconsIcon
                  className="size-3"
                  icon={ArrowUp01Icon}
                  strokeWidth={2}
                />
                {stat.change}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
