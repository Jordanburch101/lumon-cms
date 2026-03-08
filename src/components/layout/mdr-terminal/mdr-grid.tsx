"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CRT,
  GRID_COLS,
  GRID_ROWS,
  generateGridNumbers,
  mdrBins,
  mdrFileData,
  mdrHexAddress,
} from "./mdr-terminal-data";

const SCATTER_RADIUS = 80;

export function MdrGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const grid = useMemo(() => generateGridNumbers(GRID_ROWS, GRID_COLS), []);

  // Row-by-row reveal
  const [visibleRows, setVisibleRows] = useState(0);
  useEffect(() => {
    let row = 0;
    const interval = setInterval(() => {
      row++;
      setVisibleRows(row);
      if (row >= GRID_ROWS) {
        clearInterval(interval);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Randomized drift CSS variables per cell
  const driftStyles = useMemo(() => {
    const r = (range: number) => `${(Math.random() - 0.5) * range}px`;
    return Array.from({ length: GRID_ROWS * GRID_COLS }, () => ({
      "--drift-x": r(4),
      "--drift-y": r(3),
      "--drift-x2": r(4),
      "--drift-y2": r(3),
      "--drift-x3": r(4),
      "--drift-y3": r(3),
      animationDuration: `${6 + Math.random() * 8}s`,
      animationDelay: `${Math.random() * -10}s`,
    }));
  }, []);

  // Mouse proximity scatter
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const { x: mx, y: my } = mouseRef.current;
      for (const el of cellRefs.current) {
        if (!el) {
          continue;
        }
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SCATTER_RADIUS) {
          const strength = 1 - dist / SCATTER_RADIUS;
          const pushX = (dx / dist) * strength * 14;
          const pushY = (dy / dist) * strength * 14;
          el.style.transform = `translate(${pushX}px, ${pushY}px) scale(${1 + strength * 0.5})`;
          el.style.color = CRT.textBright;
          el.style.textShadow = `0 0 12px ${CRT.glowBright}, 0 0 4px ${CRT.glowBright}`;
        } else {
          el.style.transform = "";
          el.style.color = "";
          el.style.textShadow = "";
        }
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
    for (const el of cellRefs.current) {
      if (!el) {
        continue;
      }
      el.style.transform = "";
      el.style.color = "";
      el.style.textShadow = "";
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header bar — matching reference: Cold Harbor | progress bar | % Complete | LUMON */}
      <div
        className="flex items-center gap-3 px-3 py-1.5 font-mono text-[10px] lg:px-4 lg:py-2 lg:text-xs"
        style={{
          borderBottom: `1px solid ${CRT.border}`,
          color: CRT.text,
          textShadow: `0 0 6px ${CRT.glowDim}`,
        }}
      >
        <span
          className="shrink-0 border px-2 py-0.5"
          style={{ borderColor: CRT.border }}
        >
          {mdrFileData.fileName}
        </span>

        {/* Progress bar */}
        <div
          className="flex-1"
          style={{
            height: 10,
            background: `repeating-linear-gradient(
              to right,
              ${CRT.border} 0px,
              ${CRT.border} 3px,
              transparent 3px,
              transparent 5px
            )`,
            borderRadius: 2,
          }}
        />

        <span style={{ color: CRT.textBright }}>{mdrFileData.completion}</span>

        {/* Lumon logo text */}
        <span
          className="shrink-0 rounded-full border px-2.5 py-0.5 font-bold tracking-widest"
          style={{
            borderColor: CRT.borderBright,
            color: CRT.textBright,
            textShadow: `0 0 8px ${CRT.glowBright}`,
          }}
        >
          LUMON
        </span>
      </div>

      {/* Number grid */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: decorative hover effect */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: decorative hover effect */}
      <div
        className="relative flex-1 overflow-hidden p-3 lg:p-5"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={gridRef}
      >
        <div
          className="mx-auto grid h-full gap-x-0 gap-y-0 font-mono text-[11px] lg:text-sm"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            color: CRT.text,
          }}
        >
          {grid.map((row, ri) =>
            row.map((num, ci) => {
              const idx = ri * GRID_COLS + ci;
              return (
                <span
                  className="inline-flex items-center justify-center transition-[transform,color,text-shadow] duration-200"
                  key={idx}
                  ref={(el) => {
                    cellRefs.current[idx] = el;
                  }}
                  style={{
                    opacity: ri < visibleRows ? 1 : 0,
                    transition:
                      "opacity 0.3s, transform 0.2s, color 0.2s, text-shadow 0.2s",
                    animation:
                      ri < visibleRows
                        ? `mdr-drift ${driftStyles[idx].animationDuration} ease-in-out ${driftStyles[idx].animationDelay} infinite`
                        : "none",
                    textShadow: `0 0 8px ${CRT.glowDim}, 0 0 3px ${CRT.glowDim}`,
                    ...Object.fromEntries(
                      Object.entries(driftStyles[idx]).filter(([k]) =>
                        k.startsWith("--")
                      )
                    ),
                  }}
                >
                  {num}
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Bins bar — matching reference: bordered boxes with labels and fill bars */}
      <div
        className="flex items-stretch justify-center gap-2 px-3 py-2 font-mono text-[10px] lg:gap-3 lg:px-4 lg:text-xs"
        style={{ borderTop: `1px solid ${CRT.border}` }}
      >
        {mdrBins.map((bin) => (
          <div
            className="flex flex-1 flex-col items-center gap-1 border px-2 py-1.5"
            key={bin.id}
            style={{ borderColor: CRT.border }}
          >
            <span
              style={{
                color: CRT.textBright,
                textShadow: `0 0 6px ${CRT.glowDim}`,
              }}
            >
              {bin.label}
            </span>
            <div className="flex w-full items-center gap-1.5">
              <div
                className="h-1.5 flex-1 overflow-hidden"
                style={{ backgroundColor: "rgba(74, 144, 226, 0.1)" }}
              >
                <div
                  className="h-full"
                  style={{
                    backgroundColor: CRT.glow,
                    width: `${bin.fill * 100}%`,
                    transition: "width 0.5s ease",
                    boxShadow: `0 0 6px ${CRT.glowDim}`,
                  }}
                />
              </div>
              <span style={{ color: CRT.textDim, fontSize: "0.6em" }}>
                {Math.round(bin.fill * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Hex address footer */}
      <div
        className="py-1 text-center font-mono text-[9px] lg:text-[10px]"
        style={{
          color: CRT.textDim,
          borderTop: `1px solid ${CRT.border}`,
          textShadow: `0 0 4px ${CRT.glowDim}`,
        }}
      >
        {mdrHexAddress}
      </div>
    </div>
  );
}
