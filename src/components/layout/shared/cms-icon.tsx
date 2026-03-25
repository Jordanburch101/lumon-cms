// src/components/layout/shared/cms-icon.tsx
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/core/lib/utils";

import { iconMap } from "./icon-map";

// --- Types ---

interface CmsIconProps {
  className?: string;
  name: string | null | undefined;
  strokeWidth?: number;
}

// --- Component ---

export function CmsIcon({ name, className, strokeWidth = 2 }: CmsIconProps) {
  if (!name) {
    return null;
  }

  const icon = iconMap[name];
  if (!icon) {
    return null;
  }

  return (
    <HugeiconsIcon
      className={cn("size-4 text-muted-foreground", className)}
      icon={icon}
      strokeWidth={strokeWidth}
    />
  );
}
