import type { Decorator, Parameters } from "@storybook/react";

// Import the project's global styles — this loads all Tailwind v4 tokens,
// oklch colors, fonts, and utility classes into Storybook
import "../src/app/globals.css";

// ---------- Theme decorator ----------
// Applies "light" or "dark" class to <html> just like next-themes does.
// The toolbar button in Storybook controls which value is used.
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals?.theme || "light";
  document.documentElement.className = theme;
  return <Story />;
};

export const decorators: Decorator[] = [withTheme];

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

// ---------- Globals ----------
// These power the theme toggle toolbar button
export const globalTypes = {
  theme: {
    name: "Theme",
    description: "Light or dark mode",
    defaultValue: "light",
    toolbar: {
      icon: "circlehollow",
      items: [
        { value: "light", icon: "sun", title: "Light" },
        { value: "dark", icon: "moon", title: "Dark" },
      ],
      showName: true,
    },
  },
};
