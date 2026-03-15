"use client";

import { MotionConfig } from "motion/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { SearchCommandProvider } from "@/components/layout/navbar/search-command";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        <SearchCommandProvider>{children}</SearchCommandProvider>
      </NextThemesProvider>
    </MotionConfig>
  );
}
