"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
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
        <feComposite
          in="specLight"
          k1={0}
          k2={1}
          k3={1}
          k4={0}
          operator="arithmetic"
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

  // Sync viewport height to CSS variable so glass layers can extend
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const viewport = header.querySelector<HTMLElement>(
      '[data-slot="navigation-menu-viewport"]'
    );
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      header.style.setProperty("--nav-viewport-h", `${h}px`);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <GlassDistortionFilter />
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-200",
          scrolled ? "liquid-glass" : "bg-transparent",
          contrast === "light" && "liquid-glass-light",
          contrast === "dark" && "liquid-glass-dark"
        )}
        ref={headerRef}
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
