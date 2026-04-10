import type { ReactNode } from "react";
import { CRT } from "./mdr-terminal-data";

interface MdrCrtHousingProps {
  children: ReactNode;
  isOn: boolean;
}

export function MdrCrtHousing({ children, isOn }: MdrCrtHousingProps) {
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
            <div className="relative z-10 h-full">{children}</div>

            {/* Scan lines */}
            <div className="crt-scanlines absolute inset-0 z-20" />

            {/* Vignette */}
            <div className="crt-vignette absolute inset-0 z-20" />

            {/* Edge light refraction */}
            <div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                borderRadius: "inherit",
                boxShadow: `
                  inset 0 0 2px 1px rgba(100, 170, 255, ${isOn ? "0.5" : "0.1"}),
                  inset 0 0 8px 2px rgba(74, 144, 226, ${isOn ? "0.3" : "0.06"}),
                  inset 0 0 20px 4px rgba(74, 144, 226, ${isOn ? "0.12" : "0.02"}),
                  inset 0 0 50px 8px rgba(74, 144, 226, ${isOn ? "0.06" : "0.01"})
                `,
                transition: "box-shadow 1s ease",
              }}
            />
          </div>

          {/* Edge glow ring */}
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
