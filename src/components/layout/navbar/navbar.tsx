"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScrolled } from "@/core/hooks/use-scrolled";
import { cn } from "@/core/lib/utils";
import { NavbarDesktop } from "./navbar-desktop";
import { NavbarMobile } from "./navbar-mobile";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";

const DISPLACEMENT_MAP_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAA4CAYAAAAcnOVQAAACsklEQVR4nO3DsQYgBBjA8e9NeoHWtqamhoaGiIjIkUiSnJP0T85JkkQiERHR0HDDTU1tt94L9CRfz/Hx+/GbalVVVVVVVVW9f3qpVVVVVVVVVfX+6eVWVVVVVVVV1funV1pVVVVVVVVV759ebVVVVVVVVVW9f3qtVVVVVVVVVfX+6fVWVVVVVVVV1funN1pVVVVVVVVV75/ebFVVVVVVVVW9f3qrVVVVVVVVVfX+6e1WVVVVVVVV1fund1pVVVVVVVVV75/ebVVVVVVVVVW9f3qvVVVVVVVVVfX+6f1WVVVVVVVV1funB62qqqqqqqqq908ftKqqqqqqqqreP33Yqqqqqqqqqnr/9FGrqqqqqqqq6v3Tx62qqqqqqqqq90+ftKqqqqqqqqreP33aqqqqqqqqqnr/9Fmrqqqqqqqq6v3Tw1ZVVVVVVVXV+6dHraqqqqqqqqr3T5+3qqqqqqqqqt4/fdGqqqqqqqqqev/0Zauqqqqqqqrq/dNXraqqqqqqqqr3T1+3qqqqqqqqqt4/PW5VVVVVVVVVvX960qqqqqqqqqp6//RNq6qqqqqqqur907etqqqqqqqqqvdP37Wqqqqqqqqq3j9936qqqqqqqqp6//RDq6qqqqqqqur904+tqqqqqqqqqvdPP7Wqqqqqqqqq3j/93Kqqqqqqqqp6//RLq6qqqqqqqur906+tqqqqqqqqqvdPv7Wqqqqqqqqq3j/93qqqqqqqqqp6//RHq6qqqqqqqur905+tqqqqqqqqqvdPf7Wqqqqqqqqq3j/93aqqqqqqqqp6//S0VVVVVVVVVfX+6Vmrqqqqqqqq6v3TP62qqqqqqqqq90//tqqqqqqqqqrePz1vVVVVVVVVVb1/etGqqqqqqqqqev/0X6uqqqqqqqrq/VOtqqqqqqqqqvf/DxesmWmSgajmAAAAAElFTkSuQmCC";

export function Navbar() {
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled ? "liquid-glass" : "bg-transparent"
      )}
    >
      {/* Inline SVG filter for Chromium refraction */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0"
      >
        <filter
          colorInterpolationFilters="sRGB"
          id="liquid-glass"
        >
          <feImage
            height="56"
            href={DISPLACEMENT_MAP_URL}
            result="map"
            width="1920"
            x="0"
            y="0"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </svg>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
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
  );
}
