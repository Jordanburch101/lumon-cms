import { describe, expect, it } from "bun:test";
import { FaqBlock } from "@/payload/block-schemas/Faq";
import { HeroBlock } from "@/payload/block-schemas/Hero";
import { PricingBlock } from "@/payload/block-schemas/Pricing";
import { introspectBlock } from "./generate";

describe("introspect real blocks", () => {
  it("Hero has expected fields", () => {
    const result = introspectBlock(HeroBlock);
    expect(result.fields.headline).toEqual({ type: "text", required: true });
    expect(result.fields["primaryCta.label"]).toEqual({
      type: "text",
      required: true,
    });
    expect(result.fields.mediaSrc).toBeDefined();
    expect(result.fields.mediaSrc.type).toBe("upload");
  });

  it("Pricing has nested array structure", () => {
    const result = introspectBlock(PricingBlock);
    const tiers = result.fields.tiers;
    expect(tiers.type).toBe("array");
    if (tiers.type === "array") {
      expect(tiers.fields.name).toBeDefined();
      expect(tiers.fields.features.type).toBe("array");
    }
  });

  it("FAQ has items array with question and answer", () => {
    const result = introspectBlock(FaqBlock);
    const items = result.fields.items;
    expect(items.type).toBe("array");
    if (items.type === "array") {
      expect(items.fields.question).toEqual({ type: "text", required: true });
      expect(items.fields.answer).toBeDefined();
    }
  });
});
