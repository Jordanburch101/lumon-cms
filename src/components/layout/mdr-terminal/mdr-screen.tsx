"use client";

import { useCallback, useState } from "react";
import { MdrBootSequence } from "./mdr-boot-sequence";
import { MdrGrid } from "./mdr-grid";
import { CRT, type TerminalState } from "./mdr-terminal-data";

export function MdrScreen() {
  const [state, setState] = useState<TerminalState>("standby");

  const handleActivate = useCallback(() => {
    if (state !== "standby") {
      return;
    }
    setState("booting");
  }, [state]);

  const handleBootComplete = useCallback(() => {
    setState("active");
  }, []);

  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden rounded-xl lg:rounded-2xl"
      style={{
        backgroundColor: CRT.screenBg,
        boxShadow: `
          0 0 60px -10px ${CRT.glowDim},
          0 0 120px -20px rgba(74, 158, 197, 0.08),
          inset 0 0 80px -20px rgba(74, 158, 197, 0.05)
        `,
        animation:
          state !== "standby"
            ? "crt-flicker 4s ease-in-out infinite"
            : undefined,
      }}
    >
      {/* Screen content */}
      <div className="relative z-10 h-full">
        {state === "standby" && (
          <button
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 bg-transparent"
            onClick={handleActivate}
            type="button"
          >
            <span
              className="font-mono text-xs uppercase tracking-[0.3em] lg:text-sm"
              style={{ color: CRT.textDim }}
            >
              Press to initialize
            </span>
            <span
              className="inline-block h-4 w-2"
              style={{
                backgroundColor: CRT.text,
                animation: "crt-cursor-blink 1s step-end infinite",
              }}
            />
          </button>
        )}

        {state === "booting" && (
          <MdrBootSequence onComplete={handleBootComplete} />
        )}

        {state === "active" && <MdrGrid />}
      </div>

      {/* CRT overlays — always visible */}
      <div className="crt-scanlines absolute inset-0 z-20" />
      <div className="crt-vignette absolute inset-0 z-20" />
    </div>
  );
}
