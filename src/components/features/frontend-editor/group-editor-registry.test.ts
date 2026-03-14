import { describe, expect, it } from "bun:test";
import { getGroupEditor, registerGroupEditor } from "./group-editor-registry";

describe("group-editor-registry", () => {
  it("returns null for unregistered type", () => {
    expect(getGroupEditor("nonexistent")).toBeNull();
  });

  it("registers and retrieves a group editor component", () => {
    const MockEditor = () => null;
    registerGroupEditor("test-type", MockEditor as any);
    expect(getGroupEditor("test-type")).toBe(MockEditor);
  });

  it("overwrites registration for the same type", () => {
    const Editor1 = () => null;
    const Editor2 = () => null;
    registerGroupEditor("overwrite", Editor1 as any);
    registerGroupEditor("overwrite", Editor2 as any);
    expect(getGroupEditor("overwrite")).toBe(Editor2);
  });
});
