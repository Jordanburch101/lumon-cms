"use client";

import { useRef } from "react";
import { CMSLink } from "@/components/ui/cms-link";
import { useNavbarContrast } from "@/core/hooks/use-navbar-contrast";
import { cn } from "@/core/lib/utils";
import type { Header } from "@/payload-types";
import { Logo } from "../shared/logo";
import { NavbarDesktop } from "./navbar-desktop";
import { NavbarMobile } from "./navbar-mobile";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

function GlassDistortionFilter() {
  return (
    <svg aria-hidden="true" style={{ display: "none" }}>
      <filter
        filterUnits="objectBoundingBox"
        height="100%"
        id="glass-distortion"
        width="100%"
        x="0%"
        y="0%"
      >
        <feTurbulence
          baseFrequency="0.01 0.01"
          numOctaves={1}
          result="turbulence"
          seed={5}
          type="fractalNoise"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR amplitude={1} exponent={10} offset={0.5} type="gamma" />
          <feFuncG amplitude={0} exponent={1} offset={0} type="gamma" />
          <feFuncB amplitude={0} exponent={1} offset={0.5} type="gamma" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" result="softMap" stdDeviation={3} />
        <feSpecularLighting
          in="softMap"
          lightingColor="white"
          result="specLight"
          specularConstant={1}
          specularExponent={100}
          surfaceScale={5}
        >
          <fePointLight x={-200} y={-200} z={300} />
        </feSpecularLighting>
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={150}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

export function Navbar({ data }: { data: Header }) {
  const headerRef = useRef<HTMLElement>(null);
  const { contrast, scrolled } = useNavbarContrast(headerRef);

  return (
    <>
      <GlassDistortionFilter />
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-[background-color] duration-200",
          scrolled ? "liquid-glass" : "bg-transparent",
          contrast === "light" && "liquid-glass-light",
          contrast === "dark" && "liquid-glass-dark"
        )}
        ref={headerRef}
      >
        <div className={cn("liquid-glass-effect", !scrolled && "opacity-0")} />
        <div className={cn("liquid-glass-tint", !scrolled && "opacity-0")} />
        <div className={cn("liquid-glass-shine", !scrolled && "opacity-0")} />

        <div className="liquid-glass-content mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Logo data={data.logo ?? {}} />

          <NavbarDesktop navItems={data.navItems ?? []} />

          <div className="hidden items-center gap-1 md:flex">
            <SearchTrigger />
            <ThemeToggle />
            {data.cta?.show !== false && (
              <CMSLink className="ml-2" link={data.cta?.link} />
            )}
          </div>

          <NavbarMobile cta={data.cta} navItems={data.navItems ?? []} />
        </div>
      </header>
    </>
  );
}
