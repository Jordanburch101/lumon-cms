import { describe, expect, it } from "bun:test";
import {
  addArrayItem,
  duplicateBlock,
  getFieldValue,
  moveArrayItem,
  moveBlock,
  removeArrayItem,
  removeBlock,
  setFieldValue,
} from "./edit-mode-data";

const sampleBlocks = [
  {
    id: "1",
    blockType: "hero",
    headline: "Hello",
    subtext: "World",
    primaryCta: { label: "Go", href: "/go" },
  },
  {
    id: "2",
    blockType: "faq",
    headline: "Questions",
    items: [
      { id: "a", question: "Q1", answer: "A1" },
      { id: "b", question: "Q2", answer: "A2" },
      { id: "c", question: "Q3", answer: "A3" },
    ],
  },
];

describe("getFieldValue", () => {
  it("reads a simple field", () => {
    expect(getFieldValue(sampleBlocks[0], "headline")).toBe("Hello");
  });

  it("reads a dotted group field", () => {
    expect(getFieldValue(sampleBlocks[0], "primaryCta.label")).toBe("Go");
  });

  it("reads an array item field", () => {
    expect(getFieldValue(sampleBlocks[1], "items.0.question")).toBe("Q1");
  });
});

describe("setFieldValue", () => {
  it("sets a simple field immutably", () => {
    const updated = setFieldValue(sampleBlocks[0], "headline", "Changed");
    expect(updated.headline).toBe("Changed");
    expect(sampleBlocks[0].headline).toBe("Hello"); // original unchanged
  });

  it("sets a dotted group field", () => {
    const updated = setFieldValue(sampleBlocks[0], "primaryCta.href", "/new");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.primaryCta!.href).toBe("/new");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.primaryCta!.label).toBe("Go"); // sibling preserved
  });

  it("sets an array item field", () => {
    const updated = setFieldValue(sampleBlocks[1], "items.1.answer", "Updated");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![1].answer).toBe("Updated");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![0].answer).toBe("A1"); // other items unchanged
  });
});

describe("moveBlock", () => {
  it("moves a block down", () => {
    const result = moveBlock(sampleBlocks, 0, 1);
    expect(result[0].blockType).toBe("faq");
    expect(result[1].blockType).toBe("hero");
    expect(result).not.toBe(sampleBlocks); // new array
  });

  it("returns same array for out-of-bounds", () => {
    const result = moveBlock(sampleBlocks, 0, -1);
    expect(result).toBe(sampleBlocks);
  });
});

describe("removeBlock", () => {
  it("removes a block by index", () => {
    const result = removeBlock(sampleBlocks, 0);
    expect(result.length).toBe(1);
    expect(result[0].blockType).toBe("faq");
  });
});

describe("duplicateBlock", () => {
  it("duplicates a block with a new id", () => {
    const result = duplicateBlock(sampleBlocks, 0);
    expect(result.length).toBe(3);
    expect(result[1].blockType).toBe("hero");
    expect(result[1].headline).toBe("Hello");
    expect(result[1].id).not.toBe(result[0].id);
  });
});

describe("moveArrayItem", () => {
  it("moves an item within an array field", () => {
    const updated = moveArrayItem(sampleBlocks[1], "items", 0, 2);
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![0].question).toBe("Q2");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![2].question).toBe("Q1");
  });
});

describe("removeArrayItem", () => {
  it("removes an item from an array field", () => {
    const updated = removeArrayItem(sampleBlocks[1], "items", 1);
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items!.length).toBe(2);
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![0].question).toBe("Q1");
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![1].question).toBe("Q3");
  });
});

describe("addArrayItem", () => {
  it("adds an empty item to an array field", () => {
    const updated = addArrayItem(sampleBlocks[1], "items", {
      id: "d",
      question: "",
      answer: "",
    });
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items!.length).toBe(4);
    // biome-ignore lint/style/noNonNullAssertion: test data guarantees these fields exist
    expect(updated.items![3].id).toBe("d");
  });
});
