"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

const codeLines = [
  {
    indent: 0,
    tokens: [
      { text: "import", color: "text-violet-400" },
      { text: " { ", color: "text-zinc-400" },
      { text: "payload", color: "text-sky-300" },
      { text: " } ", color: "text-zinc-400" },
      { text: "from", color: "text-violet-400" },
      { text: " 'payload'", color: "text-amber-300" },
    ],
  },
  { indent: 0, tokens: [] },
  {
    indent: 0,
    tokens: [
      { text: "const", color: "text-violet-400" },
      { text: " posts", color: "text-sky-300" },
      { text: " = ", color: "text-zinc-400" },
      { text: "await", color: "text-violet-400" },
      { text: " payload.", color: "text-zinc-300" },
      { text: "find", color: "text-amber-200" },
      { text: "({", color: "text-zinc-400" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "collection", color: "text-sky-300" },
      { text: ": ", color: "text-zinc-400" },
      { text: "'posts'", color: "text-amber-300" },
      { text: ",", color: "text-zinc-400" },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "where", color: "text-sky-300" },
      { text: ": {", color: "text-zinc-400" },
    ],
  },
  {
    indent: 2,
    tokens: [
      { text: "status", color: "text-sky-300" },
      { text: ": { ", color: "text-zinc-400" },
      { text: "equals", color: "text-sky-300" },
      { text: ": ", color: "text-zinc-400" },
      { text: "'published'", color: "text-amber-300" },
      { text: " }", color: "text-zinc-400" },
    ],
  },
  { indent: 1, tokens: [{ text: "},", color: "text-zinc-400" }] },
  {
    indent: 1,
    tokens: [
      { text: "limit", color: "text-sky-300" },
      { text: ": ", color: "text-zinc-400" },
      { text: "10", color: "text-emerald-400" },
    ],
  },
  { indent: 0, tokens: [{ text: "})", color: "text-zinc-400" }] },
];

export function CodeCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-lg bg-zinc-950 p-4"
      ref={ref}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
          API
        </span>
        <div className="ml-auto flex gap-1">
          <div className="h-2 w-2 rounded-full bg-zinc-800" />
          <div className="h-2 w-2 rounded-full bg-zinc-800" />
          <div className="h-2 w-2 rounded-full bg-zinc-800" />
        </div>
      </div>
      <div className="min-h-0 flex-1 font-mono text-[11px] leading-5">
        {codeLines.map((line, i) => (
          <motion.div
            animate={inView ? { opacity: 1, x: 0 } : {}}
            initial={{ opacity: 0, x: -8 }}
            key={`line-${line.tokens.map((t) => t.text).join("") || "empty"}`}
            style={{ paddingLeft: line.indent * 16 }}
            transition={{
              delay: 0.15 + i * 0.06,
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {line.tokens.length === 0 ? (
              <span>&nbsp;</span>
            ) : (
              line.tokens.map((token) => (
                <span className={token.color} key={token.text}>
                  {token.text}
                </span>
              ))
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
