import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  // Where to find story files — our generated file lives in __fixtures__
  stories: ["../src/components/blocks/__fixtures__/**/*.stories.tsx"],

  // Addons — each adds a panel/feature to the Storybook UI
  addons: [
    "@storybook/addon-themes", // Light/dark theme toggle
    "@storybook/addon-a11y", // Accessibility audit panel
    "@github-ui/storybook-addon-performance-panel", // Perf metrics panel
  ],

  // Use the Next.js framework adapter (handles Image, Link, routing)
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },

  // TypeScript — use Storybook's built-in handling
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
};

export default config;
