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
  { id: "01", label: "01", fill: 0.77 },
  { id: "02", label: "02", fill: 0.75 },
  { id: "03", label: "03", fill: 0.59 },
  { id: "04", label: "04", fill: 0.52 },
  { id: "05", label: "05", fill: 0.75 },
] as const;

export const mdrHexAddress = "0x137056 : 0x09B32E";

export function generateGridNumbers(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 10))
  );
}

export const GRID_ROWS = 16;
export const GRID_COLS = 22;

export const CRT = {
  /** Bright blue glow — matches Severance CRT phosphor */
  glow: "#4a90e2",
  glowDim: "rgba(74, 144, 226, 0.3)",
  glowBright: "rgba(120, 180, 255, 0.8)",
  bg: "#020408",
  screenBg: "#030610",
  text: "#6aacf0",
  textDim: "rgba(106, 172, 240, 0.35)",
  textBright: "#a0d0ff",
  /** Border/chrome color for the CRT bezel and UI elements */
  border: "rgba(74, 144, 226, 0.4)",
  borderBright: "rgba(120, 180, 255, 0.6)",
  /** Error red — for failed boot lines and error states */
  error: "#e24a4a",
  errorGlow: "rgba(226, 74, 74, 0.3)",
} as const;
