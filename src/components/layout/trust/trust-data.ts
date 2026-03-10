export interface Stat {
  decimals?: number;
  format?: "k";
  label: string;
  suffix?: string;
  value: number;
}

export interface Logo {
  name: string;
}

export const trustSectionData = {
  eyebrow: "Your outie has been informed of these results",
} as const;

export const stats: Stat[] = [
  { value: 10_000, format: "k", suffix: "+", label: "Refined Files" },
  { value: 99.9, decimals: 1, suffix: "%", label: "Severance Uptime" },
  { value: 4.9, decimals: 1, suffix: "", label: "Wellness Score" },
  { value: 50, suffix: "+", label: "Departments" },
];

export const logos: Logo[] = [
  { name: "Acme" },
  { name: "Globex" },
  { name: "Initech" },
  { name: "Hooli" },
  { name: "Umbrella" },
];
