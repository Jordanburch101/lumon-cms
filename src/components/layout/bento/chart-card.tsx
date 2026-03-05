"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { chartData } from "./bento-data";

const chartConfig = {
  visitors: {
    label: "Visitors",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

export function ChartCard() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-background p-4">
      <span className="mb-2 text-[11px] text-muted-foreground uppercase tracking-wider">
        Analytics
      </span>
      <div className="mb-1 flex items-baseline gap-3">
        <span className="font-semibold text-2xl tabular-nums">+24%</span>
        <span className="text-muted-foreground text-xs">monthly visitors</span>
      </div>
      <div className="min-h-0 flex-1">
        <ChartContainer
          className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:text-[10px]"
          config={chartConfig}
        >
          <AreaChart data={[...chartData]}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={6}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillVisitors" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-visitors)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-visitors)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="visitors"
              fill="url(#fillVisitors)"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
