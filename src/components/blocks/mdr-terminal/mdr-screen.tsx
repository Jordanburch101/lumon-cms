"use client";

import { useCallback, useState } from "react";
import { MdrBootSequence } from "./mdr-boot-sequence";
import { MdrCrtHousing } from "./mdr-crt-housing";
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
    <MdrCrtHousing isOn={isOn}>
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
    </MdrCrtHousing>
  );
}
