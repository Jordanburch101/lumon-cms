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

  const isOn = state !== "standby";

  return (
    /* Layer 1: Outer monitor housing — the plastic/metal shell */
    <div
      className="relative mx-auto w-full max-w-4xl"
      style={{
        borderRadius: "clamp(28px, 5vw, 56px)",
        background:
          "linear-gradient(170deg, #141c2e 0%, #0a0f1a 40%, #0c1222 100%)",
        padding: "clamp(6px, 1vw, 12px)",
        boxShadow: `
          0 4px 60px -10px rgba(0, 0, 0, 0.8),
          0 0 120px -20px rgba(74, 144, 226, ${isOn ? "0.2" : "0.05"}),
          inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
          inset 0 -1px 0 0 rgba(0, 0, 0, 0.4)
        `,
        transition: "box-shadow 1s ease",
      }}
    >
      {/* Layer 2: Inner bezel ridge — the sloped edge around the glass */}
      <div
        style={{
          borderRadius: "clamp(22px, 4vw, 46px)",
          background: "linear-gradient(180deg, #0e1524 0%, #080c18 100%)",
          padding: "clamp(8px, 1.5vw, 16px)",
          boxShadow: `
            inset 0 2px 4px 0 rgba(0, 0, 0, 0.6),
            inset 0 -1px 2px 0 rgba(120, 180, 255, 0.04),
            inset 2px 0 4px 0 rgba(0, 0, 0, 0.3),
            inset -2px 0 4px 0 rgba(0, 0, 0, 0.3)
          `,
        }}
      >
        {/* Layer 3: Screen glass bezel — the lip right around the glass */}
        <div
          className="relative"
          style={{
            borderRadius: "clamp(14px, 2.5vw, 28px)",
            /* The glass bezel ring — visible border with glow */
            boxShadow: `
              0 0 0 1.5px rgba(74, 144, 226, ${isOn ? "0.3" : "0.12"}),
              0 0 0 3px rgba(10, 15, 26, 0.9),
              0 0 ${isOn ? "30px" : "8px"} -2px rgba(74, 144, 226, ${isOn ? "0.15" : "0.03"})
            `,
            transition: "box-shadow 1s ease",
          }}
        >
          {/* The screen itself */}
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "16 / 10",
              backgroundColor: CRT.screenBg,
              borderRadius: "inherit",
              animation: isOn
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
                    style={{
                      color: CRT.text,
                      textShadow: `0 0 10px ${CRT.glowBright}, 0 0 20px ${CRT.glowDim}`,
                    }}
                  >
                    Press to initialize
                  </span>
                  <span
                    className="inline-block h-4 w-2"
                    style={{
                      backgroundColor: CRT.textBright,
                      boxShadow: `0 0 8px ${CRT.glow}, 0 0 16px ${CRT.glowDim}`,
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

            {/* Scan lines */}
            <div className="crt-scanlines absolute inset-0 z-20" />

            {/* Edge light refraction — bright glow along screen edges where light bends around curved glass */}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                borderRadius: "inherit",
                boxShadow: `
                  inset 0 0 30px 2px rgba(74, 144, 226, ${isOn ? "0.12" : "0.03"}),
                  inset 0 0 60px 4px rgba(74, 144, 226, ${isOn ? "0.06" : "0.01"}),
                  inset 0 0 4px 1px rgba(74, 144, 226, ${isOn ? "0.2" : "0.05"})
                `,
                transition: "box-shadow 1s ease",
              }}
            />

            {/* Vignette — corners darken like real CRT */}
            <div className="crt-vignette absolute inset-0 z-20" />

            {/* Top edge highlight — light refracting off curved glass top */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-30"
              style={{
                height: "30%",
                background: `linear-gradient(180deg, rgba(120, 180, 255, ${isOn ? "0.03" : "0.01"}) 0%, transparent 100%)`,
                borderRadius: "inherit",
              }}
            />
          </div>

          {/* Edge glow ring — light bleeding out around the glass edges */}
          <div
            className="pointer-events-none absolute inset-0 z-[-1]"
            style={{
              borderRadius: "inherit",
              boxShadow: `
                0 0 15px 2px rgba(74, 144, 226, ${isOn ? "0.12" : "0.02"}),
                0 0 40px 5px rgba(74, 144, 226, ${isOn ? "0.06" : "0.01"})
              `,
              transition: "box-shadow 1s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
