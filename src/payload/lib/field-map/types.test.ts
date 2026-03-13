import { describe, expect, it } from "bun:test";
import type { ArrayFieldDescriptor, FieldDescriptor, FieldMap } from "./types";

describe("FieldMap types", () => {
  it("allows a simple text field descriptor", () => {
    const field: FieldDescriptor = { type: "text", required: true };
    expect(field.type).toBe("text");
  });

  it("allows an array field with nested fields", () => {
    const field: ArrayFieldDescriptor = {
      type: "array",
      fields: {
        name: { type: "text", required: true },
      },
    };
    expect(field.type).toBe("array");
    expect(field.fields.name.type).toBe("text");
  });

  it("allows a complete block field map", () => {
    const map: FieldMap = {
      hero: {
        headline: { type: "text", required: true },
        mediaSrc: { type: "upload", relationTo: "media", required: true },
      },
    };
    expect(Object.keys(map.hero)).toContain("headline");
  });
});
