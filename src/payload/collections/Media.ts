import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";
import { isAdminOrEditor } from "../access";
import { generateBlurDataURL } from "../hooks/generateBlurDataURL";
import { optimizeVideo } from "../hooks/optimizeVideo";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const revalidate = revalidateOnChange();

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

const validateFileSize: CollectionBeforeValidateHook = ({ req }) => {
  if (req.file && req.file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size ${(req.file.size / 1024 / 1024).toFixed(0)}MB exceeds the ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB limit`
    );
  }
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeValidate: [validateFileSize],
    beforeChange: [generateBlurDataURL],
    afterChange: [optimizeVideo, revalidate.afterChange],
    afterDelete: [revalidate.afterDelete],
  },
  upload: {
    mimeTypes: ["image/*", "video/*"],
    // Note: formatOptions and resizeOptions are omitted because they apply to
    // ALL uploads via sharp — including videos, which sharp cannot process.
    // Image optimization is handled by imageSizes (which Payload skips for
    // non-image mimeTypes). WebP conversion can be added per-imageSize if needed.
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
      defaultValue: false,
      admin: {
        description: "Remove audio track from the video during optimization",
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
