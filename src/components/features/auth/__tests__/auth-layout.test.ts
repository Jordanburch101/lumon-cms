/**
 * Structural tests for the AuthLayout module.
 *
 * React 19 and next/link cannot be used directly in bun's test runner
 * (no DOM, ReactSharedInternals not initialized). Instead we verify the
 * module's source structure via static analysis of the file contents.
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const USE_CLIENT_RE = /^["']use client["']/;

const src = readFileSync(
  resolve(import.meta.dir, "../auth-layout.tsx"),
  "utf-8"
);

describe("AuthLayout module structure", () => {
  test("exports AuthLayout function", () => {
    expect(src).toContain("export function AuthLayout");
  });

  test("is a client component", () => {
    expect(src).toMatch(USE_CLIENT_RE);
  });

  test("renders children via props", () => {
    expect(src).toContain("{children}");
  });

  test("has 'Back to site' link", () => {
    expect(src).toContain("Back to site");
  });

  test("has logo linking to /", () => {
    expect(src).toContain('href="/"');
    expect(src).toContain("LogoSvg");
  });

  test("renders heading prop with default 'Lumon Industries'", () => {
    expect(src).toContain("{heading}");
    expect(src).toContain('heading = "Lumon Industries"');
  });

  test("renders subtext prop with default", () => {
    expect(src).toContain("{subtext}");
    expect(src).toContain('subtext = "The work is mysterious and important."');
  });

  test("accepts mediaSrc prop with default video URL", () => {
    expect(src).toContain("mediaSrc");
    expect(src).toContain("hero-vid-new.mp4");
  });

  test("supports video and image media", () => {
    expect(src).toContain("<video");
    expect(src).toContain("<Image");
    expect(src).toContain("isVideoUrl");
  });

  test("has LogoSvg with accessibility attributes", () => {
    expect(src).toContain('aria-label="Lumon Industries logo"');
    expect(src).toContain('role="img"');
  });

  test("has dark overlay on media panel", () => {
    expect(src).toContain("bg-black/50");
  });

  test("uses motion components for animation", () => {
    expect(src).toContain("motion.div");
    expect(src).toContain("useInView");
  });

  test("has mobile-only logo (hidden on lg)", () => {
    expect(src).toContain("lg:hidden");
  });
});
