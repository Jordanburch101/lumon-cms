import { describe, expect, it, mock } from "bun:test";
import { activateTextEditor } from "./text-editor";

/** Minimal HTMLElement-like stub for testing activateTextEditor. */
function makeElement(text: string): HTMLElement {
  const listeners: Record<string, EventListener[]> = {};
  const el = {
    contentEditable: "inherit",
    textContent: text,
    style: { cursor: "", outline: "" } as CSSStyleDeclaration,
    addEventListener(type: string, fn: EventListener) {
      listeners[type] ??= [];
      listeners[type].push(fn);
    },
    removeEventListener(type: string, fn: EventListener) {
      listeners[type] = (listeners[type] ?? []).filter((l) => l !== fn);
    },
    dispatchEvent(event: Event) {
      for (const fn of listeners[event.type] ?? []) {
        fn(event);
      }
    },
    remove() {
      /* no-op stub */
    },
  };
  return el as unknown as HTMLElement;
}

describe("activateTextEditor", () => {
  it("sets contentEditable on the element", () => {
    const el = makeElement("Hello");
    // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional no-op callback
    const cleanup = activateTextEditor(el, 0, "headline", () => {});
    expect(el.contentEditable).toBe("true");
    cleanup();
  });

  it("calls onUpdate with field path and value on blur", () => {
    const el = makeElement("Hello");
    // biome-ignore lint/suspicious/noEmptyBlockStatements: mock tracking only, no return needed
    const onUpdate = mock(() => {});
    const cleanup = activateTextEditor(el, 0, "headline", onUpdate);

    el.textContent = "Changed";
    el.dispatchEvent(new Event("blur"));

    expect(onUpdate).toHaveBeenCalledWith(0, "headline", "Changed");
    cleanup();
  });

  it("cleanup removes contentEditable and event listener", () => {
    const el = makeElement("Hello");
    // biome-ignore lint/suspicious/noEmptyBlockStatements: mock tracking only, no return needed
    const onUpdate = mock(() => {});
    const cleanup = activateTextEditor(el, 0, "headline", onUpdate);
    cleanup();

    expect(el.contentEditable).toBe("false");
    el.dispatchEvent(new Event("blur"));
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
