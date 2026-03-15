import type { Block } from "payload";
import { link } from "../fields/link/link";

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Hero" },
  fields: [
    {
      name: "variant",
      type: "select",
      defaultValue: "default",
      options: [
        { label: "Default (Full Bleed)", value: "default" },
        { label: "Centered", value: "centered" },
        { label: "Split", value: "split" },
        { label: "Minimal", value: "minimal" },
      ],
    },
    {
      name: "mediaSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.variant !== "minimal",
        description: "Required for Default, Centered, and Split variants.",
      },
      validate: (
        val: unknown,
        { siblingData }: { siblingData: Record<string, unknown> }
      ) => {
        const variant = (siblingData?.variant as string) ?? "default";
        if (variant === "minimal") return true;
        // Split variant can use stats instead of media
        const stats = siblingData?.stats as unknown[] | undefined;
        if (variant === "split" && stats && stats.length > 0) return true;
        if (!val) return "Media is required for this variant";
        return true;
      },
    },
    {
      name: "posterSrc",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => siblingData?.variant !== "minimal",
        description:
          "Still image shown while a video loads. Upload a frame from the video for best results.",
      },
    },
    { name: "headline", type: "text", required: true },
    { name: "subtext", type: "text", required: true },
    {
      name: "stats",
      type: "array",
      maxRows: 4,
      admin: {
        condition: (_, siblingData) => siblingData?.variant === "split",
        description:
          "Displayed in place of media on the Split variant. Leave empty to use media instead.",
      },
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
      ],
    },
    link({
      name: "primaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["default", "outline"], sizes: ["lg"] },
      },
    }),
    link({
      name: "secondaryCta",
      required: true,
      appearance: {
        type: ["button"],
        button: { variants: ["outline", "default"], sizes: ["lg"] },
      },
    }),
  ],
};
