import type { SelectField } from "payload";

export const iconOptions = [
  // From navbar-data.ts (confirmed in codebase)
  { label: "Analytics Up", value: "analytics-up" },
  { label: "Brain", value: "brain" },
  { label: "Camera Video", value: "camera-video" },
  { label: "Chart", value: "chart" },
  { label: "DNA", value: "dna" },
  { label: "File", value: "file" },
  { label: "Heart Check", value: "heart-check" },
  { label: "Labor", value: "labor" },
  { label: "Mail", value: "mail" },
  { label: "Microscope", value: "microscope" },
  { label: "News", value: "news" },
  { label: "Shield", value: "shield" },
  { label: "User Group", value: "user-group" },
  { label: "User", value: "user" },
  // From features-grid/icon-map.tsx (confirmed in codebase)
  { label: "Bar Chart", value: "bar-chart" },
  { label: "Code", value: "code" },
  { label: "CPU", value: "cpu" },
  { label: "Database", value: "database" },
  { label: "Flash", value: "flash" },
  { label: "Globe", value: "globe" },
  { label: "Layers", value: "layers" },
  { label: "Lock", value: "lock" },
  { label: "Sync", value: "sync" },
  { label: "Settings", value: "settings" },
  { label: "Shield (Outline)", value: "shield-01" },
  // From search-data.ts (confirmed in codebase)
  { label: "Cloud", value: "cloud" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Headphones", value: "headphones" },
  { label: "Laptop", value: "laptop" },
  { label: "Search", value: "search" },
  // Broader selection (verified in @hugeicons/core-free-icons)
  { label: "Arrow Right", value: "arrow-right" },
  { label: "Bookmark", value: "bookmark" },
  { label: "Calendar", value: "calendar" },
  { label: "Call", value: "call" },
  { label: "Check", value: "check" },
  { label: "Clock", value: "clock" },
  { label: "Download", value: "download" },
  { label: "Link", value: "link" },
  { label: "Location", value: "location" },
  { label: "Puzzle", value: "puzzle" },
  { label: "Rocket", value: "rocket" },
  { label: "Star", value: "star" },
  { label: "Tag", value: "tag" },
  { label: "Upload", value: "upload" },
  { label: "Zap", value: "zap" },
] as const;

export type IconKey = (typeof iconOptions)[number]["value"];

export interface IconPickerOptions {
  label?: string;
  name?: string;
  required?: boolean;
}

export function iconPicker(opts?: IconPickerOptions): SelectField {
  return {
    name: opts?.name ?? "icon",
    type: "select",
    label: opts?.label ?? "Icon",
    required: opts?.required ?? false,
    options: [...iconOptions],
  };
}
