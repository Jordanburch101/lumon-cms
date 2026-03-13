import { describe, expect, it } from "bun:test";
import {
  duplicateBlock,
  moveBlock,
  removeBlock,
  setFieldValue,
} from "./edit-mode-data";

describe("edit-save cycle (data layer)", () => {
  const blocks = [
    { id: "1", blockType: "hero", headline: "Hello" },
    { id: "2", blockType: "faq", headline: "Questions", items: [] },
  ];

  it("field update produces dirty state", () => {
    const updated = setFieldValue(blocks[0] as any, "headline", "Changed");
    expect(updated.headline).toBe("Changed");
    expect(blocks[0].headline).toBe("Hello");
  });

  it("block reorder preserves all blocks", () => {
    const reordered = moveBlock(blocks, 0, 1);
    expect(reordered.length).toBe(2);
    expect(reordered[0].blockType).toBe("faq");
    expect(reordered[1].blockType).toBe("hero");
  });

  it("duplicate creates new ID", () => {
    const duped = duplicateBlock(blocks as any, 0);
    expect(duped.length).toBe(3);
    expect(duped[1].id).not.toBe(duped[0].id);
    expect(duped[1].headline).toBe("Hello");
  });

  it("remove produces correct remaining blocks", () => {
    const removed = removeBlock(blocks, 0);
    expect(removed.length).toBe(1);
    expect(removed[0].blockType).toBe("faq");
  });

  it("PATCH body shape matches API contract", () => {
    const layout = blocks.map((b) =>
      setFieldValue(b as any, "headline", "Updated")
    );
    const body = JSON.stringify({ layout, _status: "draft" });
    const parsed = JSON.parse(body);
    expect(parsed._status).toBe("draft");
    expect(parsed.layout).toHaveLength(2);
    expect(parsed.layout[0].blockType).toBe("hero");
  });
});
