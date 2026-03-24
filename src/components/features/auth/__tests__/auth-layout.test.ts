/**
 * Structural tests for the AuthLayout module (right panel wrapper).
 *
 * The cinematic left panel is now in auth-sidebar.tsx (tested separately).
 * AuthLayout is just the right-side content wrapper with back link and mobile logo.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve(import.meta.dir, "../auth-layout.tsx"),
  "utf-8"
);

describe("AuthLayout module structure", () => {
  test("exports AuthLayout function", () => {
    expect(src).toContain("export function AuthLayout");
  });

  test("is a client component", () => {
    expect(src).toMatch(/^["']use client["']/);
  });

  test("renders children via props", () => {
    expect(src).toContain("{children}");
  });

  test("has 'Back to site' link to /", () => {
    expect(src).toContain("Back to site");
    expect(src).toContain('href="/"');
  });

  test("has mobile-only logo linking to /", () => {
    expect(src).toContain("lg:hidden");
    expect(src).toContain("LogoSvg");
  });

  test("uses motion for entrance animation", () => {
    expect(src).toContain("motion.div");
    expect(src).toContain("useInView");
  });

  test("imports EASE from shared constants", () => {
    expect(src).toContain("EASE");
    expect(src).toContain("./auth-constants");
  });

  test("uses next/link for navigation", () => {
    expect(src).toContain('from "next/link"');
  });

  test("uses shared LogoSvg from auth-constants", () => {
    expect(src).toContain("LogoSvg");
    expect(src).toContain("./auth-constants");
  });

  test("constrains content width", () => {
    expect(src).toContain("max-w-[380px]");
  });
});
