"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="h-full">
      <CardHeader>
        <CardDescription>Monthly Visitors</CardDescription>
        <CardTitle className="text-2xl">+24%</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-40 w-full"
          config={chartConfig}
        >
          <AreaChart data={[...chartData]}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickLine={false}
              tickMargin={8}
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
      </CardContent>
    </Card>
  );
}
