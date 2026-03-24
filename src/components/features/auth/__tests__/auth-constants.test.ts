/**
 * Tests for shared auth constants — animation values and field variants.
 *
 * Spinner tests are limited to type-checking since React JSX cannot be
 * rendered in bun's test runner without a DOM environment.
 */
import { describe, expect, test } from "bun:test";
import { EASE, fieldVariants, Spinner } from "../auth-constants";

describe("EASE", () => {
  test("is a 4-element cubic bezier tuple", () => {
    expect(EASE).toHaveLength(4);
  });

  test("has correct values [0.16, 1, 0.3, 1]", () => {
    expect(EASE[0]).toBe(0.16);
    expect(EASE[1]).toBe(1);
    expect(EASE[2]).toBe(0.3);
    expect(EASE[3]).toBe(1);
  });
});

describe("fieldVariants", () => {
  test("returns initial state with opacity 0 and y 16", () => {
    const result = fieldVariants(0, true);
    expect(result.initial).toEqual({ opacity: 0, y: 16 });
  });

  test("initial state is the same regardless of inView", () => {
    const a = fieldVariants(0, true);
    const b = fieldVariants(0, false);
    expect(a.initial).toEqual(b.initial);
  });

  test("returns animate with opacity 1 and y 0 when inView is true", () => {
    const result = fieldVariants(0, true);
    expect(result.animate).toHaveProperty("opacity", 1);
    expect(result.animate).toHaveProperty("y", 0);
  });

  test("returns empty animate object when inView is false", () => {
    const result = fieldVariants(0, false);
    expect(result.animate).toEqual({});
  });

  test("calculates delay based on index: delay = 0.1 + i * 0.05", () => {
    const result0 = fieldVariants(0, true);
    const result3 = fieldVariants(3, true);
    const result10 = fieldVariants(10, true);

    const t0 = (result0.animate as { transition: { delay: number } })
      .transition;
    const t3 = (result3.animate as { transition: { delay: number } })
      .transition;
    const t10 = (result10.animate as { transition: { delay: number } })
      .transition;

    expect(t0.delay).toBeCloseTo(0.1);
    expect(t3.delay).toBeCloseTo(0.25);
    expect(t10.delay).toBeCloseTo(0.6);
  });

  test("animate transition has duration 0.7 and correct ease", () => {
    const result = fieldVariants(0, true);
    const transition = (
      result.animate as {
        transition: { duration: number; ease: readonly number[] };
      }
    ).transition;

    expect(transition.duration).toBe(0.7);
    expect(transition.ease).toEqual(EASE);
  });

  test("no transition property when inView is false", () => {
    const result = fieldVariants(0, false);
    expect(result.animate).not.toHaveProperty("transition");
  });
});

describe("Spinner", () => {
  test("is a function component", () => {
    expect(typeof Spinner).toBe("function");
  });

  test("function accepts a props object with optional className", () => {
    // Verify function.length (params count) — Spinner takes 1 arg
    expect(Spinner.length).toBe(1);
  });
});
