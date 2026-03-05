"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const metricDescriptions: Record<string, string> = {
  FCP: "First Contentful Paint",
  LCP: "Largest Contentful Paint",
  TBT: "Total Blocking Time",
  CLS: "Cumulative Layout Shift",
  SI: "Speed Index",
};

// 5 segments with 8° gaps between them (360 - 40 = 320° / 5 = 64° each)
const GAP = 8;
const ARC_LEN = 64;
const segments = [
  { label: "FCP", start: 0, end: ARC_LEN },
  { label: "LCP", start: ARC_LEN + GAP, end: 2 * ARC_LEN + GAP },
  { label: "TBT", start: 2 * (ARC_LEN + GAP), end: 3 * ARC_LEN + 2 * GAP },
  { label: "CLS", start: 3 * (ARC_LEN + GAP), end: 4 * ARC_LEN + 3 * GAP },
  { label: "SI", start: 4 * (ARC_LEN + GAP), end: 5 * ARC_LEN + 4 * GAP },
];

const CENTER = 80;
const RADIUS = 54;
const STROKE = 9;
const LABEL_RADIUS = RADIUS + 20;
const GREEN = "#0cce6b";
const GREEN_BG = "#0cce6b15";
const GREEN_FILL = "#0cce6b08";
const DOT_RADIUS = 4.5;

function degreesToRadians(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}

function polarToXY(angle: number, r: number) {
  const rad = degreesToRadians(angle);
  return {
    x: Math.round((CENTER + r * Math.cos(rad)) * 100) / 100,
    y: Math.round((CENTER + r * Math.sin(rad)) * 100) / 100,
  };
}

function describeArc(start: number, end: number, r: number) {
  const s = polarToXY(start, r);
  const e = polarToXY(end, r);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

function AnimatedNumber({
  target,
  inView,
}: {
  target: number;
  inView: boolean;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    const controls = animate(motionValue, target, {
      duration: 1.8,
      delay: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [motionValue, rounded, target, inView]);

  return (
    <motion.text
      animate={inView ? { opacity: 1 } : {}}
      dominantBaseline="central"
      fill={GREEN}
      fontFamily="var(--font-mono)"
      fontSize="32"
      fontWeight="500"
      initial={{ opacity: 0 }}
      textAnchor="middle"
      transition={{ delay: 0.3, duration: 0.5 }}
      x={CENTER}
      y={CENTER}
    >
      {display}
    </motion.text>
  );
}

export function StatsCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      className="flex h-full flex-col items-center justify-center rounded-lg bg-background p-4"
      ref={ref}
    >
      <span className="mb-1 self-start text-[11px] text-muted-foreground uppercase tracking-wider">
        Metrics
      </span>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <TooltipProvider>
          {/* Tooltip triggers positioned absolutely over label locations */}
          {segments.map((seg) => {
            const midAngle = (seg.start + seg.end) / 2;
            const labelPos = polarToXY(midAngle, LABEL_RADIUS);
            // Convert SVG coords to percentage positions within the 160x160 viewBox
            const leftPct = Math.round((labelPos.x / 160) * 1000) / 10;
            const topPct = Math.round((labelPos.y / 160) * 1000) / 10;
            return (
              <Tooltip key={`tip-${seg.label}`}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute z-10 h-5 w-8 -translate-x-1/2 -translate-y-1/2 cursor-default"
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    type="button"
                  >
                    <span className="sr-only">
                      {metricDescriptions[seg.label]}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={4}>
                  {metricDescriptions[seg.label]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>

        <svg
          aria-label="Performance score: 100"
          className="text-foreground"
          height="160"
          role="img"
          viewBox="0 0 160 160"
          width="160"
        >
          {/* Subtle green center fill */}
          <circle
            cx={CENTER}
            cy={CENTER}
            fill={GREEN_FILL}
            r={RADIUS - STROKE / 2}
          />

          {/* Background arcs (faint) */}
          {segments.map((seg) => (
            <path
              d={describeArc(seg.start, seg.end, RADIUS)}
              fill="none"
              key={`bg-${seg.label}`}
              stroke={GREEN_BG}
              strokeLinecap="round"
              strokeWidth={STROKE}
            />
          ))}

          {/* Animated colored arcs */}
          {segments.map((seg, i) => {
            const arcLength =
              ((seg.end - seg.start) / 360) * 2 * Math.PI * RADIUS;
            return (
              <motion.path
                animate={inView ? { strokeDashoffset: 0 } : {}}
                d={describeArc(seg.start, seg.end, RADIUS)}
                fill="none"
                initial={{ strokeDashoffset: arcLength }}
                key={`arc-${seg.label}`}
                stroke={GREEN}
                strokeDasharray={arcLength}
                strokeLinecap="round"
                strokeWidth={STROKE}
                transition={{
                  duration: 1.2,
                  delay: 0.2 + i * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            );
          })}

          {/* Dots between segments (at gap midpoints) */}
          {segments.map((seg, i) => {
            const nextSeg = segments[(i + 1) % segments.length];
            const gapMid =
              i < segments.length - 1
                ? (seg.end + nextSeg.start) / 2
                : (seg.end + 360) / 2;
            const dotPos = polarToXY(gapMid, RADIUS);
            return (
              <motion.circle
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                cx={dotPos.x}
                cy={dotPos.y}
                fill={GREEN}
                initial={{ opacity: 0, scale: 0 }}
                key={`dot-${seg.label}`}
                r={DOT_RADIUS}
                transition={{
                  delay: 0.9 + i * 0.1,
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            );
          })}

          {/* Labels at segment midpoints */}
          {segments.map((seg, i) => {
            const midAngle = (seg.start + seg.end) / 2;
            const labelPos = polarToXY(midAngle, LABEL_RADIUS);
            return (
              <motion.text
                animate={inView ? { opacity: 0.45 } : {}}
                dominantBaseline="central"
                fill="currentColor"
                fontFamily="var(--font-sans)"
                fontSize="10"
                initial={{ opacity: 0 }}
                key={`label-${seg.label}`}
                textAnchor="middle"
                transition={{
                  delay: 0.7 + i * 0.1,
                  duration: 0.5,
                }}
                x={labelPos.x}
                y={labelPos.y}
              >
                {seg.label}
              </motion.text>
            );
          })}

          {/* Center number */}
          <AnimatedNumber inView={inView} target={100} />
        </svg>
      </div>
      <motion.p
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="font-medium text-foreground text-sm"
        initial={{ opacity: 0, y: 4 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        Performance
      </motion.p>
    </div>
  );
}
