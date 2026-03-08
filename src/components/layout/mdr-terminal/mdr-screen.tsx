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
    <>
      {/* SVG filter for barrel distortion — hidden, referenced by CSS */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: hidden SVG filter, not visual content */}
      <svg
        aria-hidden
        className="absolute h-0 w-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Barrel distortion: displaces pixels outward from center, creating CRT screen curvature */}
          <filter id="crt-barrel">
            {/* Create a radial gradient displacement map */}
            <feImage
              height="100%"
              href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Cdefs%3E%3CradialGradient id='g' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%23808080'/%3E%3Cstop offset='100%25' stop-color='%23606060'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='400' height='250' fill='url(%23g)'/%3E%3C/svg%3E"
              result="map"
              width="100%"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale="40"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Outer bezel — the physical CRT housing */}
      <div
        className="relative mx-auto w-full max-w-4xl"
        style={{
          padding: "clamp(14px, 2.5vw, 28px)",
          background:
            "linear-gradient(145deg, #0c1220 0%, #060a14 50%, #0a1018 100%)",
          borderRadius: "clamp(20px, 3.5vw, 40px)",
          boxShadow: `
            0 0 120px -20px ${CRT.glowDim},
            0 0 240px -40px rgba(74, 144, 226, 0.18),
            inset 0 1px 0 0 rgba(120, 180, 255, 0.1),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.5)
          `,
        }}
      >
        {/* Ambient light spill — blue glow bleeding onto the bezel from the screen */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            borderRadius: "inherit",
            background:
              "radial-gradient(ellipse at center, rgba(74, 144, 226, 0.06) 30%, transparent 70%)",
          }}
        />

        {/* Inner screen — the glass surface with barrel distortion */}
        <div
          className="crt-screen relative overflow-hidden"
          style={{
            aspectRatio: "16 / 10",
            backgroundColor: CRT.screenBg,
            borderRadius: "clamp(10px, 2vw, 20px)",
            border: `1.5px solid ${CRT.border}`,
            boxShadow: `
              inset 0 0 80px -10px ${CRT.glowDim},
              inset 0 0 160px -30px rgba(74, 144, 226, 0.12),
              0 0 30px -5px ${CRT.glowDim}
            `,
            animation:
              state !== "standby"
                ? "crt-flicker 4s ease-in-out infinite"
                : undefined,
            filter: "url(#crt-barrel)",
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
          <div className="crt-chromatic absolute inset-0 z-20" />

          {/* Glass reflection highlight — top-left area like real CRT glass */}
          <div
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(120, 180, 255, 0.04) 0%, transparent 50%)",
            }}
          />
        </div>
      </div>
    </>
  );
}
