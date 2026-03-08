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
    /* Outer bezel — the physical CRT housing */
    <div
      className="relative mx-auto w-full max-w-4xl"
      style={{
        padding: "clamp(12px, 2vw, 24px)",
        background: `
          linear-gradient(145deg, #0c1220 0%, #060a14 50%, #0a1018 100%)
        `,
        borderRadius: "clamp(16px, 3vw, 32px)",
        boxShadow: `
          0 0 100px -20px ${CRT.glowDim},
          0 0 200px -40px rgba(74, 144, 226, 0.15),
          inset 0 1px 0 0 rgba(120, 180, 255, 0.08),
          inset 0 -1px 0 0 rgba(0, 0, 0, 0.5)
        `,
      }}
    >
      {/* Inner screen — the glass surface */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 10",
          backgroundColor: CRT.screenBg,
          borderRadius: "clamp(8px, 1.5vw, 16px)",
          border: `1px solid ${CRT.border}`,
          boxShadow: `
            inset 0 0 60px -10px ${CRT.glowDim},
            inset 0 0 120px -20px rgba(74, 144, 226, 0.1)
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
    </div>
  );
}
