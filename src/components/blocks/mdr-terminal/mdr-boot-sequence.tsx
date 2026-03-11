"use client";

import { useEffect, useState } from "react";
import {
  BOOT_DURATION_MS,
  type BootLine,
  bootSequence,
  CRT,
} from "./mdr-terminal-data";

interface BootSequenceProps {
  onComplete: () => void;
}

interface VisibleLine {
  line: BootLine;
  showSuffix: boolean;
}

export function MdrBootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<VisibleLine[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const line of bootSequence) {
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

    timers.push(setTimeout(onComplete, BOOT_DURATION_MS));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col gap-0.5 p-6 font-mono text-sm lg:p-10 lg:text-base">
      {visibleLines.map((vl) => (
        <div key={vl.line.delay} style={{ color: CRT.text }}>
          {vl.line.text}
          {vl.line.suffix && (
            <span
              className="ml-4"
              style={{
                color: CRT.textBright,
                opacity: vl.showSuffix ? 1 : 0,
                transition: "opacity 0.15s",
              }}
            >
              {vl.line.suffix}
            </span>
          )}
        </div>
      ))}
      <span
        className="mt-1 inline-block h-4 w-2"
        style={{
          backgroundColor: CRT.text,
          animation: "crt-cursor-blink 1s step-end infinite",
        }}
      />
    </div>
  );
}
