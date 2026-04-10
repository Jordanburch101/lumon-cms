"use client";

import { useEffect, useState } from "react";
import {
  BOOT_404_DURATION_MS,
  type BootLine,
  boot404Sequence,
  CRT,
} from "./mdr-terminal-data";

interface VisibleLine {
  line: BootLine;
  showSuffix: boolean;
}

function isErrorLine(line: BootLine): boolean {
  return (
    line.suffix === "ERR" ||
    line.text.startsWith("FILE:") ||
    line.text.startsWith("STATUS:") ||
    line.text.startsWith("ERR 0x404") ||
    line.text.startsWith("ASSIGNED TO")
  );
}

export function Mdr404BootSequence() {
  const [visibleLines, setVisibleLines] = useState<VisibleLine[]>([]);
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const line of boot404Sequence) {
      timers.push(
        setTimeout(() => {
          setVisibleLines((prev) => [...prev, { line, showSuffix: false }]);
        }, line.delay)
      );

      if (line.suffix && line.suffixDelay) {
        timers.push(
          setTimeout(() => {
            setVisibleLines((prev) =>
              prev.map((vl) =>
                vl.line === line ? { ...vl, showSuffix: true } : vl
              )
            );
          }, line.delay + line.suffixDelay)
        );
      }
    }

    timers.push(
      setTimeout(() => {
        setShowCursor(true);
      }, BOOT_404_DURATION_MS)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-0.5 p-6 font-mono text-sm lg:p-10 lg:text-base">
      {visibleLines.map((vl) => {
        const error = isErrorLine(vl.line);
        const textColor = error ? CRT.error : CRT.text;
        const textShadow = error ? `0 0 8px ${CRT.errorGlow}` : undefined;

        return (
          <div key={vl.line.delay} style={{ color: textColor, textShadow }}>
            {vl.line.text}
            {vl.line.suffix && (
              <span
                className="ml-4"
                style={{
                  color: vl.line.suffix === "ERR" ? CRT.error : CRT.textBright,
                  textShadow:
                    vl.line.suffix === "ERR"
                      ? `0 0 8px ${CRT.errorGlow}`
                      : undefined,
                  opacity: vl.showSuffix ? 1 : 0,
                  transition: "opacity 0.15s",
                }}
              >
                {vl.line.suffix}
              </span>
            )}
          </div>
        );
      })}
      {showCursor && (
        <span
          className="mt-1 inline-block h-4 w-2"
          style={{
            backgroundColor: CRT.text,
            animation: "crt-cursor-blink 1s step-end infinite",
          }}
        />
      )}
    </div>
  );
}
