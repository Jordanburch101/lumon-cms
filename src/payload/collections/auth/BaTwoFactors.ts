import type { CollectionConfig } from "payload";

export const BaTwoFactors: CollectionConfig = {
  slug: "ba-two-factors",
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "secret", type: "text", required: true, index: true },
    { name: "backupCodes", type: "text" },
    { name: "userId", type: "number", required: true, index: true },
  ],
};
