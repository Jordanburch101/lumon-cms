import { describe, expect, it } from "bun:test";
import type { Block } from "payload";
import { introspectBlock, introspectBlocks } from "./generate";

const SimpleBlock: Block = {
  slug: "simple",
  labels: { singular: "Simple", plural: "Simple" },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "count", type: "number", min: 0, max: 100 },
    { name: "visible", type: "checkbox" },
  ],
};

const GroupBlock: Block = {
  slug: "grouped",
  labels: { singular: "Grouped", plural: "Grouped" },
  fields: [
    { name: "headline", type: "text", required: true },
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text" },
      ],
    },
  ],
};

const ArrayBlock: Block = {
  slug: "listed",
  labels: { singular: "Listed", plural: "Listed" },
  fields: [
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 10,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

const NestedArrayBlock: Block = {
  slug: "nested",
  labels: { singular: "Nested", plural: "Nested" },
  fields: [
    {
      name: "tiers",
      type: "array",
      fields: [
        { name: "name", type: "text", required: true },
        {
          name: "features",
          type: "array",
          fields: [{ name: "text", type: "text", required: true }],
        },
      ],
    },
  ],
};

const SkippableBlock: Block = {
  slug: "skippable",
  labels: { singular: "Skippable", plural: "Skippable" },
  fields: [
    { name: "title", type: "text" },
    { name: "content", type: "richText" },
    { name: "custom", type: "ui", admin: { components: {} } } as any,
    {
      type: "row",
      fields: [
        { name: "col1", type: "text" },
        { name: "col2", type: "text" },
      ],
    },
    {
      type: "collapsible",
      label: "More",
      fields: [{ name: "extra", type: "text" }],
    },
  ],
};

const SelectBlock: Block = {
  slug: "selectable",
  labels: { singular: "Selectable", plural: "Selectable" },
  fields: [
    {
      name: "format",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Thousands", value: "k" },
      ],
    },
    { name: "email", type: "email" },
    { name: "published", type: "date" },
    { name: "location", type: "point" },
  ],
};

const LinkGroupBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    { name: "headline", type: "text", required: true },
    {
      name: "primaryCta",
      type: "group",
      custom: { groupType: "link" },
      fields: [
        {
          name: "type",
          type: "select",
          options: [
            { label: "Internal", value: "internal" },
            { label: "External", value: "external" },
          ],
        },
        { name: "label", type: "text", required: true },
        { name: "url", type: "text" },
        {
          name: "reference",
          type: "relationship",
          relationTo: ["pages"],
        },
        { name: "newTab", type: "checkbox" },
        {
          name: "buttonVariant",
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Outline", value: "outline" },
          ],
        },
      ],
    },
  ],
};

const PlainGroupBlock: Block = {
  slug: "plain",
  labels: { singular: "Plain", plural: "Plain" },
  fields: [
    {
      name: "cta",
      type: "group",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};

describe("introspectBlock", () => {
  it("handles simple text, number, and checkbox fields", () => {
    const result = introspectBlock(SimpleBlock);
    expect(result.fields.title).toEqual({ type: "text", required: true });
    expect(result.fields.count).toEqual({ type: "number", min: 0, max: 100 });
    expect(result.fields.visible).toEqual({ type: "checkbox" });
  });

  it("flattens group fields with dot notation", () => {
    const result = introspectBlock(GroupBlock);
    expect(result.fields["cta.label"]).toEqual({
      type: "text",
      required: true,
    });
    expect(result.fields["cta.href"]).toEqual({ type: "text" });
    expect(result.fields.cta).toBeUndefined();
  });

  it("handles array fields with nested field maps", () => {
    const result = introspectBlock(ArrayBlock);
    const items = result.fields.items;
    expect(items).toBeDefined();
    expect(items.type).toBe("array");
    if (items.type === "array") {
      expect(items.minRows).toBe(1);
      expect(items.maxRows).toBe(10);
      expect(items.fields.title).toEqual({ type: "text", required: true });
      expect(items.fields.image).toEqual({
        type: "upload",
        relationTo: "media",
      });
    }
  });

  it("handles nested arrays (array in array)", () => {
    const result = introspectBlock(NestedArrayBlock);
    const tiers = result.fields.tiers;
    expect(tiers.type).toBe("array");
    if (tiers.type === "array") {
      expect(tiers.fields.name).toEqual({ type: "text", required: true });
      const features = tiers.fields.features;
      expect(features.type).toBe("array");
      if (features.type === "array") {
        expect(features.fields.text).toEqual({ type: "text", required: true });
      }
    }
  });

  it("skips richText, ui, and unwraps row/collapsible layout fields", () => {
    const result = introspectBlock(SkippableBlock);
    expect(result.fields.title).toEqual({ type: "text" });
    // richText skipped
    expect(result.fields.content).toBeUndefined();
    // ui skipped
    expect(result.fields.custom).toBeUndefined();
    // row fields unwrapped
    expect(result.fields.col1).toEqual({ type: "text" });
    expect(result.fields.col2).toEqual({ type: "text" });
    // collapsible fields unwrapped
    expect(result.fields.extra).toEqual({ type: "text" });
  });

  it("handles select with options, email, date, point", () => {
    const result = introspectBlock(SelectBlock);
    expect(result.fields.format).toEqual({
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Thousands", value: "k" },
      ],
    });
    expect(result.fields.email).toEqual({ type: "email" });
    expect(result.fields.published).toEqual({ type: "date" });
    expect(result.fields.location).toEqual({ type: "point" });
  });

  it("extracts block metadata", () => {
    const result = introspectBlock(SimpleBlock);
    expect(result.meta).toEqual({ label: "Simple", slug: "simple" });
  });

  describe("group with custom.groupType", () => {
    it("emits GroupFieldDescriptor instead of flattening", () => {
      const result = introspectBlock(LinkGroupBlock);
      const primaryCta = result.fields.primaryCta;
      expect(primaryCta).toBeDefined();
      expect(primaryCta.type).toBe("group");
      if (primaryCta.type === "group") {
        expect(primaryCta.groupType).toBe("link");
        expect(primaryCta.fields.label).toEqual({
          type: "text",
          required: true,
        });
        expect(primaryCta.fields.url).toEqual({ type: "text" });
        expect(primaryCta.fields.reference).toEqual({
          type: "relationship",
          relationTo: ["pages"],
        });
        expect(primaryCta.fields.newTab).toEqual({ type: "checkbox" });
        expect(primaryCta.fields.type).toEqual({
          type: "select",
          options: [
            { label: "Internal", value: "internal" },
            { label: "External", value: "external" },
          ],
        });
        expect(primaryCta.fields.buttonVariant).toEqual({
          type: "select",
          options: [
            { label: "Default", value: "default" },
            { label: "Outline", value: "outline" },
          ],
        });
      }
      // Flattened keys should NOT exist
      expect(result.fields["primaryCta.label"]).toBeUndefined();
      expect(result.fields["primaryCta.url"]).toBeUndefined();
    });

    it("still flattens groups WITHOUT custom.groupType", () => {
      const result = introspectBlock(PlainGroupBlock);
      // Flattened as before
      expect(result.fields["cta.label"]).toEqual({ type: "text" });
      expect(result.fields["cta.href"]).toEqual({ type: "text" });
      // No group entry
      expect(result.fields.cta).toBeUndefined();
    });
  });
});

describe("introspectBlocks", () => {
  it("produces a field map and block meta map from multiple blocks", () => {
    const { fieldMap, blockMeta } = introspectBlocks([SimpleBlock, GroupBlock]);
    expect(Object.keys(fieldMap)).toEqual(["simple", "grouped"]);
    expect(fieldMap.simple.title).toEqual({ type: "text", required: true });
    expect(fieldMap.grouped["cta.label"]).toEqual({
      type: "text",
      required: true,
    });
    expect(blockMeta.simple).toEqual({ label: "Simple", slug: "simple" });
    expect(blockMeta.grouped).toEqual({ label: "Grouped", slug: "grouped" });
  });
});
