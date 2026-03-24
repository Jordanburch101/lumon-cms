/**
 * Structural tests for the LoginPage module.
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
  resolve(import.meta.dir, "../login-page.tsx"),
  "utf-8"
);

describe("LoginPage module structure", () => {
  test("exports a LoginPage function", () => {
    expect(src).toContain("export function LoginPage");
  });

  test("is a client component", () => {
    expect(src).toMatch(USE_CLIENT_RE);
  });

  test("renders AuthLayout wrapper", () => {
    expect(src).toContain("<AuthLayout>");
  });

  test("has email input field", () => {
    expect(src).toContain('id="email"');
    expect(src).toContain('type="email"');
  });

  test("has password input field", () => {
    expect(src).toContain('id="password"');
    expect(src).toContain('type="password"');
  });

  test("has Sign In submit button", () => {
    expect(src).toContain('type="submit"');
    expect(src).toContain('"Sign In"');
  });

  test("has Magic Link button", () => {
    expect(src).toContain("Sign in with Magic Link");
    expect(src).toContain('type="button"');
  });

  test("has Forgot? link pointing to /forgot-password", () => {
    expect(src).toContain('href="/forgot-password"');
    expect(src).toContain("Forgot?");
  });

  test("has administrator contact footer text", () => {
    expect(src).toContain("Contact your administrator");
  });

  test("disables buttons when loading", () => {
    expect(src).toContain("disabled={loading}");
  });

  test("shows error message conditionally", () => {
    expect(src).toContain("{error && (");
  });

  test("uses authClient for sign-in", () => {
    expect(src).toContain("authClient.signIn.email");
  });

  test("uses authClient for magic link", () => {
    expect(src).toContain("authClient.signIn.magicLink");
  });

  test("redirects to /admin on success", () => {
    expect(src).toContain('window.location.href = "/admin"');
  });

  test("shows magic link sent confirmation", () => {
    expect(src).toContain("Check your email for a magic link");
  });

  test("uses Spinner component when loading", () => {
    expect(src).toContain("<Spinner");
  });

  test("uses fieldVariants for animations", () => {
    expect(src).toContain("fieldVariants");
  });
});
