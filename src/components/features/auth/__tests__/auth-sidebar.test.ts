/**
 * Structural tests for the AuthSidebar module (cinematic left panel).
 */

import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = readFileSync(
  resolve(import.meta.dir, "../auth-sidebar.tsx"),
  "utf-8"
);

describe("AuthSidebar module structure", () => {
  test("exports AuthSidebar function", () => {
    expect(src).toContain("export function AuthSidebar");
  });

  test("is a client component", () => {
    expect(src).toMatch(/^["']use client["']/);
  });

  test("has default mediaSrc with video URL", () => {
    expect(src).toContain("mediaSrc");
    expect(src).toContain("hero-vid-new.mp4");
  });

  test("has default heading 'Lumon Industries'", () => {
    expect(src).toContain('heading = "Lumon Industries"');
  });

  test("has default subtext", () => {
    expect(src).toContain('subtext = "The work is mysterious and important."');
  });

  test("supports video media", () => {
    expect(src).toContain("<video");
    expect(src).toContain("isVideoUrl");
  });

  test("supports image media via next/image", () => {
    expect(src).toContain("<Image");
    expect(src).toContain('from "next/image"');
  });

  test("has dark overlay", () => {
    expect(src).toContain("bg-black/50");
  });

  test("has grid texture with radial mask", () => {
    expect(src).toContain("backgroundSize");
    expect(src).toContain("maskImage");
  });

  test("has logo linking to /", () => {
    expect(src).toContain('href="/"');
    expect(src).toContain("LogoSvg");
  });

  test("uses shared LogoSvg from auth-constants", () => {
    expect(src).toContain("LogoSvg");
    expect(src).toContain("./auth-constants");
  });

  test("hidden below lg breakpoint", () => {
    expect(src).toContain("hidden");
    expect(src).toContain("lg:block");
  });

  test("uses motion for animations", () => {
    expect(src).toContain("motion.div");
    expect(src).toContain("useInView");
  });

  test("imports EASE from shared constants", () => {
    expect(src).toContain("EASE");
    expect(src).toContain("./auth-constants");
  });
});
