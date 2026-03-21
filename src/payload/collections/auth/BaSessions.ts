import type { CollectionConfig } from "payload";

export const BaSessions: CollectionConfig = {
  slug: "ba-sessions",
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "token", type: "text", required: true, unique: true, index: true },
    { name: "userId", type: "number", required: true, index: true },
    { name: "expiresAt", type: "date", required: true },
    { name: "ipAddress", type: "text" },
    { name: "userAgent", type: "text" },
  ],
};
