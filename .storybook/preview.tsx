import type { Parameters } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

// Import the project's global styles — this loads all Tailwind v4 tokens,
// oklch colors, fonts, and utility classes into Storybook
import "../src/app/globals.css";

// ---------- Theme decorator ----------
// Uses addon-themes to apply "light" or "dark" class to <html>,
// matching how next-themes works in the real app.
// This fires reliably on initial render (unlike manual decorators).
export const decorators = [
  withThemeByClassName({
    defaultTheme: "light",
    themes: {
      light: "light",
      dark: "dark",
    },
  }),
];

// ---------- Global parameters ----------
export const parameters: Parameters = {
  // Viewport presets matching Tailwind breakpoints
  viewport: {
    viewports: {
      mobile: {
        name: "Mobile",
        styles: { width: "390px", height: "844px" },
      },
      sm: {
        name: "sm (640px)",
        styles: { width: "640px", height: "800px" },
      },
      md: {
        name: "md (768px)",
        styles: { width: "768px", height: "1024px" },
      },
      lg: {
        name: "lg (1024px)",
        styles: { width: "1024px", height: "768px" },
      },
      xl: {
        name: "xl (1280px)",
        styles: { width: "1280px", height: "800px" },
      },
    },
  },
  // Default layout — fullscreen so blocks render at full width
  layout: "fullscreen",
};
