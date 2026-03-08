export type TerminalState = "standby" | "booting" | "active";

export interface BootLine {
  delay: number;
  suffix?: string;
  suffixDelay?: number;
  text: string;
}

export const bootSequence: BootLine[] = [
  { text: "LUMON INDUSTRIES (tm)", delay: 0 },
  { text: "MDR TERMINAL v2.0", delay: 200 },
  { text: "", delay: 600 },
  {
    text: "INITIALIZING NEURAL PARTITION...",
    delay: 800,
    suffix: "OK",
    suffixDelay: 400,
  },
  {
    text: "LOADING COGNITIVE INTERFACE...",
    delay: 1500,
    suffix: "OK",
    suffixDelay: 350,
  },
  {
    text: "ESTABLISHING INNIE PROTOCOL...",
    delay: 2200,
    suffix: "OK",
    suffixDelay: 300,
  },
  { text: "", delay: 2800 },
  { text: "FILE: COLD HARBOR", delay: 3000 },
  { text: "STATUS: 0% COMPLETE", delay: 3200 },
  { text: "", delay: 3600 },
  { text: "BEGINNING REFINEMENT SESSION...", delay: 3800 },
];

export const BOOT_DURATION_MS = 4400;

export const mdrFileData = {
  fileName: "Cold Harbor",
  completion: "0% Complete",
} as const;

export const mdrBins = [
  { id: "WO", label: "WO", color: "#5b8a72", fill: 0.0 },
  { id: "FC", label: "FC", color: "#c9b968", fill: 0.0 },
  { id: "DR", label: "DR", color: "#3b5998", fill: 0.0 },
  { id: "MA", label: "MA", color: "#2a4a7f", fill: 0.0 },
] as const;

export function generateGridNumbers(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 10))
  );
}

export const GRID_ROWS = 14;
export const GRID_COLS = 16;

export const CRT = {
  glow: "#4a9ec5",
  glowDim: "rgba(74, 158, 197, 0.15)",
  glowBright: "rgba(74, 158, 197, 0.6)",
  bg: "#0a0e14",
  screenBg: "#060a10",
  text: "#7ab8d4",
  textDim: "rgba(122, 184, 212, 0.3)",
  textBright: "#b8e0f0",
} as const;
