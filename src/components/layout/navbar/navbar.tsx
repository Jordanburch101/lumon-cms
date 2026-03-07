"use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNavbarContrast } from "@/core/hooks/use-navbar-contrast";
import { useScrolled } from "@/core/hooks/use-scrolled";
import { cn } from "@/core/lib/utils";
import { NavbarDesktop } from "./navbar-desktop";
import { NavbarMobile } from "./navbar-mobile";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

function GlassDistortionFilter() {
  return (
    <svg aria-hidden="true" style={{ display: "none" }}>
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves={1}
          seed={5}
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR
            type="gamma"
            amplitude={1}
            exponent={10}
            offset={0.5}
          />
          <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
          <feFuncB
            type="gamma"
            amplitude={0}
            exponent={1}
            offset={0.5}
          />
        </feComponentTransfer>
        <feGaussianBlur
          in="turbulence"
          stdDeviation={3}
          result="softMap"
        />
        <feSpecularLighting
          in="softMap"
          surfaceScale={5}
          specularConstant={1}
          specularExponent={100}
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x={-200} y={-200} z={300} />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1={0}
          k2={1}
          k3={1}
          k4={0}
          result="litImage"
        />
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

export function Navbar() {
  const scrolled = useScrolled();
  const headerRef = useRef<HTMLElement>(null);
  const contrast = useNavbarContrast(headerRef);

  return (
    <>
      <GlassDistortionFilter />
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled ? "liquid-glass" : "bg-transparent",
          scrolled && contrast === "light" && "liquid-glass-light",
          scrolled && contrast === "dark" && "liquid-glass-dark"
        )}
      >
        {scrolled && (
          <>
            <div className="liquid-glass-effect" />
            <div className="liquid-glass-tint" />
            <div className="liquid-glass-shine" />
          </>
        )}

        <div className="liquid-glass-content mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link className="flex items-center" href="/">
            <span className="font-semibold text-base tracking-tight">
              Lumon<span className="text-muted-foreground">Payload</span>
            </span>
          </Link>

          <NavbarDesktop />

          <div className="hidden items-center gap-1 md:flex">
            <SearchTrigger />
            <ThemeToggle />
            <Button className="ml-2" size="default">
              Get Started
            </Button>
          </div>

          <NavbarMobile />
        </div>
      </header>
    </>
  );
}
