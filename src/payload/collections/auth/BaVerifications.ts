import type { CollectionConfig } from "payload";

export const BaVerifications: CollectionConfig = {
  slug: "ba-verifications",
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "identifier", type: "text", required: true, index: true },
    { name: "value", type: "text", required: true },
    { name: "expiresAt", type: "date", required: true },
  ],
};
