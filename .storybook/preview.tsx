import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Parameters } from "@storybook/react";

// Import the project's global styles — this loads all Tailwind v4 tokens,
// oklch colors, fonts, and utility classes into Storybook
import "../src/app/globals.css";

// ---------- Layout decorator ----------
// Wraps each story with the same spacing that RenderBlocks provides on the
// real site (py-16 lg:py-32), plus bg-background so the theme colors apply.
// This means blocks look correct without modifying their own padding.
const withBlockSpacing: Decorator = (Story) => (
  <div className="bg-background py-16 lg:py-32">
    <Story />
  </div>
);

// ---------- Theme decorator ----------
// Uses addon-themes to apply "light" or "dark" class to <html>,
// matching how next-themes works in the real app.
// This fires reliably on initial render (unlike manual decorators).
export const decorators: Decorator[] = [
  withBlockSpacing,
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
