import { describe, expect, it } from "bun:test";
import type {
  ArrayFieldDescriptor,
  BlockFieldMap,
  FieldDescriptor,
  FieldEntry,
  FieldMap,
  GroupFieldDescriptor,
} from "./types";

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

describe("GroupFieldDescriptor", () => {
  it("is a valid FieldEntry in a BlockFieldMap", () => {
    const group: GroupFieldDescriptor = {
      type: "group",
      groupType: "link",
      fields: {
        label: { type: "text" },
        url: { type: "text" },
        reference: { type: "relationship", relationTo: ["pages"] },
        newTab: { type: "checkbox" },
      },
    };

    const map: BlockFieldMap = {
      title: { type: "text", required: true },
      primaryCta: group,
    };

    const entry: FieldEntry = map.primaryCta;
    expect(entry.type).toBe("group");
    if (entry.type === "group") {
      expect(entry.groupType).toBe("link");
      expect(Object.keys(entry.fields)).toEqual([
        "label",
        "url",
        "reference",
        "newTab",
      ]);
    }
  });
});
