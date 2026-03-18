import { describe, expect, it } from "bun:test";
import {
  extractFirstImageFromBlocks,
  extractFirstTextFromBlocks,
} from "./extract-block-content";

// ── extractFirstTextFromBlocks ───────────────────────────────────────

describe("extractFirstTextFromBlocks", () => {
  it("returns undefined for null layout", () => {
    expect(extractFirstTextFromBlocks(null)).toBeUndefined();
  });

  it("returns undefined for undefined layout", () => {
    expect(extractFirstTextFromBlocks(undefined)).toBeUndefined();
  });

  it("returns undefined for empty layout array", () => {
    expect(extractFirstTextFromBlocks([])).toBeUndefined();
  });

  it("extracts hero subtext", () => {
    const layout = [
      { blockType: "hero", subtext: "Welcome to our site." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("Welcome to our site.");
  });

  it("extracts splitMedia first row body", () => {
    const layout = [
      {
        blockType: "splitMedia",
        rows: [{ body: "First row description." }],
      } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("First row description.");
  });

  it("extracts cinematicCta subtext", () => {
    const layout = [
      { blockType: "cinematicCta", subtext: "Take the next step." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("Take the next step.");
  });

  it("extracts bento subtext", () => {
    const layout = [
      { blockType: "bento", subtext: "Explore our offerings." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("Explore our offerings.");
  });

  it("returns first block's text when multiple blocks have text", () => {
    const layout = [
      { blockType: "hero", subtext: "First block text." } as any,
      { blockType: "bento", subtext: "Second block text." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("First block text.");
  });

  it("truncates text over 160 chars at sentence boundary", () => {
    // Period at index 89 (> 80), total text > 160 chars.
    // truncateToSentence slices at the last period within the first 160 chars.
    const text = `${"A".repeat(89)}. ${"B".repeat(80)}`;
    expect(text.length).toBeGreaterThan(160);

    const result = extractFirstTextFromBlocks([
      { blockType: "hero", subtext: text } as any,
    ]);

    expect(result).toBeDefined();
    expect((result as string).length).toBeLessThanOrEqual(160);
    expect(result?.endsWith(".")).toBe(true);
  });

  it("truncates with ellipsis when no sentence boundary after 80 chars", () => {
    // 170 chars with no period after position 80
    const text = `${"A".repeat(80)} ${"B".repeat(90)}`;
    expect(text.length).toBeGreaterThan(160);

    const result = extractFirstTextFromBlocks([
      { blockType: "hero", subtext: text } as any,
    ]);

    expect(result).toBeDefined();
    expect(result?.endsWith("…")).toBe(true);
    // Should be at most 161 chars (160 chars + ellipsis)
    expect((result as string).length).toBeLessThanOrEqual(161);
  });

  it("skips blocks with empty text", () => {
    const layout = [
      { blockType: "hero", subtext: "" } as any,
      { blockType: "bento", subtext: "Bento text here." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("Bento text here.");
  });

  it("skips blocks with whitespace-only text", () => {
    const layout = [
      { blockType: "hero", subtext: "   " } as any,
      { blockType: "cinematicCta", subtext: "Call to action text." } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBe("Call to action text.");
  });

  it("returns undefined when no blocks have usable text", () => {
    const layout = [
      { blockType: "hero", subtext: "" } as any,
      { blockType: "imageGallery", items: [] } as any,
    ];
    expect(extractFirstTextFromBlocks(layout)).toBeUndefined();
  });

  it("trims leading and trailing whitespace before returning", () => {
    const layout = [{ blockType: "hero", subtext: "  Trimmed text.  " } as any];
    expect(extractFirstTextFromBlocks(layout)).toBe("Trimmed text.");
  });
});

// ── extractFirstImageFromBlocks ──────────────────────────────────────

describe("extractFirstImageFromBlocks", () => {
  it("returns undefined for null layout", () => {
    expect(extractFirstImageFromBlocks(null)).toBeUndefined();
  });

  it("returns undefined for undefined layout", () => {
    expect(extractFirstImageFromBlocks(undefined)).toBeUndefined();
  });

  it("returns undefined for empty layout array", () => {
    expect(extractFirstImageFromBlocks([])).toBeUndefined();
  });

  it("extracts hero mediaSrc as a raw number", () => {
    const layout = [{ blockType: "hero", mediaSrc: 42 } as any];
    expect(extractFirstImageFromBlocks(layout)).toBe(42);
  });

  it("extracts hero mediaSrc from a populated object with id", () => {
    const layout = [
      {
        blockType: "hero",
        mediaSrc: { id: 7, url: "/media/hero.jpg" },
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(7);
  });

  it("extracts splitMedia first row mediaSrc as a raw number", () => {
    const layout = [
      {
        blockType: "splitMedia",
        rows: [{ mediaSrc: 99 }],
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(99);
  });

  it("extracts splitMedia first row mediaSrc from a populated object", () => {
    const layout = [
      {
        blockType: "splitMedia",
        rows: [{ mediaSrc: { id: 13, url: "/media/split.jpg" } }],
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(13);
  });

  it("extracts bento image.src as a raw number", () => {
    const layout = [
      {
        blockType: "bento",
        image: { src: 55 },
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(55);
  });

  it("extracts bento image.src from a populated object", () => {
    const layout = [
      {
        blockType: "bento",
        image: { src: { id: 20, url: "/media/bento.jpg" } },
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(20);
  });

  it("extracts imageGallery first item image as a raw number", () => {
    const layout = [
      {
        blockType: "imageGallery",
        items: [{ image: 88 }],
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(88);
  });

  it("extracts imageGallery first item image from a populated object", () => {
    const layout = [
      {
        blockType: "imageGallery",
        items: [{ image: { id: 33, url: "/media/gallery.jpg" } }],
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(33);
  });

  it("returns first block's image when multiple blocks have images", () => {
    const layout = [
      { blockType: "hero", mediaSrc: 1 } as any,
      { blockType: "bento", image: { src: 2 } } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(1);
  });

  it("skips blocks with no media and returns first match", () => {
    const layout = [
      { blockType: "imageGallery", items: [] } as any,
      { blockType: "hero", mediaSrc: 77 } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(77);
  });

  it("returns undefined when no blocks have media", () => {
    const layout = [
      { blockType: "imageGallery", items: [] } as any,
      { blockType: "splitMedia", rows: [] } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBeUndefined();
  });

  it("skips hero with null mediaSrc", () => {
    const layout = [
      { blockType: "hero", mediaSrc: null } as any,
      {
        blockType: "bento",
        image: { src: { id: 5, url: "/media/bento.jpg" } },
      } as any,
    ];
    expect(extractFirstImageFromBlocks(layout)).toBe(5);
  });
});
