import {
  BarChartIcon,
  CodeIcon,
  CpuIcon,
  Database01Icon,
  FlashIcon,
  Globe02Icon,
  Layers01Icon,
  LockIcon,
  Refresh01Icon,
  Settings01Icon,
  Shield01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export const FEATURE_ICONS: Record<string, IconSvgElement> = {
  layers: Layers01Icon,
  shieldCheck: Shield01Icon,
  lightning: FlashIcon,
  lock: LockIcon,
  chart: BarChartIcon,
  sync: Refresh01Icon,
  globe: Globe02Icon,
  code: CodeIcon,
  database: Database01Icon,
  cpu: CpuIcon,
  users: UserGroupIcon,
  settings: Settings01Icon,
};
