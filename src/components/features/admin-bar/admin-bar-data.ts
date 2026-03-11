export type SnapPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface AdminBarState {
  collapsed: boolean;
  position: SnapPosition;
}

export interface PageContext {
  id: number;
  slug: string;
}

export interface AdminUser {
  email: string;
  id: number;
  name?: string;
}

const STORAGE_KEY = "lumon-admin-bar";
const LEADING_SLASH_RE = /^\//;
const TRAILING_SLASH_RE = /\/$/;

const DEFAULT_STATE: AdminBarState = {
  position: "bottom-center",
  collapsed: false,
};

export const SNAP_POSITIONS: Record<
  SnapPosition,
  { className: string; label: string }
> = {
  "top-left": { className: "top-4 left-4", label: "Top left" },
  "top-center": {
    className: "top-4 left-1/2 -translate-x-1/2",
    label: "Top center",
  },
  "top-right": { className: "top-4 right-4", label: "Top right" },
  "bottom-left": { className: "bottom-4 left-4", label: "Bottom left" },
  "bottom-center": {
    className: "bottom-4 left-1/2 -translate-x-1/2",
    label: "Bottom center",
  },
  "bottom-right": { className: "bottom-4 right-4", label: "Bottom right" },
};

export function loadBarState(): AdminBarState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw) as Partial<AdminBarState>;
    return {
      position:
        parsed.position && parsed.position in SNAP_POSITIONS
          ? parsed.position
          : DEFAULT_STATE.position,
      collapsed: parsed.collapsed ?? DEFAULT_STATE.collapsed,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveBarState(state: AdminBarState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function getSlugFromPathname(pathname: string): string {
  if (pathname === "/") {
    return "home";
  }
  return pathname.replace(LEADING_SLASH_RE, "").replace(TRAILING_SLASH_RE, "");
}
