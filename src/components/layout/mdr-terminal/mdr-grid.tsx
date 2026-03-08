"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CRT,
  GRID_COLS,
  GRID_ROWS,
  generateGridNumbers,
  mdrBins,
  mdrFileData,
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
      if (row >= GRID_ROWS) clearInterval(interval);
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
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const { x: mx, y: my } = mouseRef.current;
      for (let i = 0; i < cellRefs.current.length; i++) {
        const el = cellRefs.current[i];
        if (!el) continue;
        const cx = el.offsetLeft + el.offsetWidth / 2;
        const cy = el.offsetTop + el.offsetHeight / 2;
        const dx = cx - mx;
        const dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < SCATTER_RADIUS) {
          const strength = 1 - dist / SCATTER_RADIUS;
          const pushX = (dx / dist) * strength * 12;
          const pushY = (dy / dist) * strength * 12;
          el.style.transform = `translate(${pushX}px, ${pushY}px)`;
          el.style.color = CRT.textBright;
          el.style.textShadow = `0 0 8px ${CRT.glowBright}`;
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
      if (!el) continue;
      el.style.transform = "";
      el.style.color = "";
      el.style.textShadow = "";
    }
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2 font-mono text-xs lg:px-6 lg:text-sm"
        style={{
          borderColor: "rgba(74, 158, 197, 0.2)",
          color: CRT.text,
        }}
      >
        <span>{mdrFileData.fileName}</span>
        <span style={{ color: CRT.textDim }}>{mdrFileData.completion}</span>
        <span className="font-bold tracking-wider" style={{ color: CRT.glow }}>
          LUMON
        </span>
      </div>

      {/* Number grid */}
      <div
        className="relative flex-1 overflow-hidden p-4 lg:p-6"
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={gridRef}
      >
        <div
          className="mx-auto grid gap-x-3 gap-y-1 font-mono text-sm lg:text-base"
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
                  key={idx}
                  className="inline-block text-center transition-[transform,color,text-shadow] duration-200"
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
                    textShadow: `0 0 4px ${CRT.glowDim}`,
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

      {/* Bins bar */}
      <div
        className="flex items-center justify-center gap-6 border-t px-4 py-3 font-mono text-xs lg:gap-10 lg:px-6"
        style={{ borderColor: "rgba(74, 158, 197, 0.2)" }}
      >
        {mdrBins.map((bin) => (
          <div className="flex items-center gap-2" key={bin.id}>
            <span style={{ color: CRT.textDim }}>{bin.label}</span>
            <div
              className="h-2 w-16 overflow-hidden rounded-sm lg:w-20"
              style={{ backgroundColor: "rgba(74, 158, 197, 0.1)" }}
            >
              <div
                className="h-full rounded-sm"
                style={{
                  backgroundColor: bin.color,
                  width: `${bin.fill * 100}%`,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
