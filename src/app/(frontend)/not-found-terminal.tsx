"use client";

import Link from "next/link";
import { Mdr404BootSequence } from "@/components/blocks/mdr-terminal/mdr-404-boot-sequence";
import { MdrCrtHousing } from "@/components/blocks/mdr-terminal/mdr-crt-housing";
import { CRT } from "@/components/blocks/mdr-terminal/mdr-terminal-data";

export function NotFoundTerminal() {
  return (
    <section
      className="w-full py-24 lg:py-32"
      style={{ backgroundColor: CRT.bg }}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {/* CRT Monitor */}
        <MdrCrtHousing isOn>
          <Mdr404BootSequence />
        </MdrCrtHousing>

        {/* Copy + CTA below terminal */}
        <div className="mt-10 text-center lg:mt-16">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: CRT.textDim }}
          >
            The requested file has not been refined
          </p>
          <Link
            className="mt-6 inline-block border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors"
            href="/"
            style={{
              borderColor: CRT.border,
              color: CRT.textBright,
            }}
          >
            Return to lobby
          </Link>
        </div>
      </div>
    </section>
  );
}
