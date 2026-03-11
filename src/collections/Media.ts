import type { CollectionConfig } from "payload";
import { generateBlurDataURL } from "./hooks/generateBlurDataURL";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [generateBlurDataURL],
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    formatOptions: {
      format: "webp",
      options: { quality: 82 },
    },
    resizeOptions: {
      width: 2560,
      height: 2560,
      fit: "inside",
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
      },
      {
        name: "hero",
        width: 1920,
        height: undefined,
        withoutEnlargement: true,
      },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "stripAudio",
      type: "checkbox",
      defaultValue: true,
      admin: {
        condition: (data) => data?.mimeType?.startsWith("video/"),
      },
    },
    {
      name: "blurDataURL",
      type: "text",
      admin: {
        hidden: true,
      },
    },
  ],
};
