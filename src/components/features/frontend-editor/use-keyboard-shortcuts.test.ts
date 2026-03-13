import { describe, expect, it } from "bun:test";
import { matchShortcut } from "./use-keyboard-shortcuts";

describe("matchShortcut", () => {
  const makeEvent = (key: string, meta = false, shift = false) =>
    ({ key, metaKey: meta, ctrlKey: false, shiftKey: shift }) as KeyboardEvent;

  it("matches Cmd+E", () => {
    expect(matchShortcut(makeEvent("e", true))).toBe("toggle");
  });

  it("matches Cmd+S", () => {
    expect(matchShortcut(makeEvent("s", true))).toBe("saveDraft");
  });

  it("matches Cmd+Shift+S (browsers send uppercase S with Shift)", () => {
    expect(matchShortcut(makeEvent("S", true, true))).toBe("publish");
  });

  it("matches Escape", () => {
    expect(matchShortcut(makeEvent("Escape"))).toBe("exit");
  });

  it("returns null for unrecognized combos", () => {
    expect(matchShortcut(makeEvent("a", true))).toBeNull();
  });

  it("returns null for bare letter keys", () => {
    expect(matchShortcut(makeEvent("e"))).toBeNull();
  });
});
