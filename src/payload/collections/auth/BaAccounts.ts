import type { CollectionConfig } from "payload";

export const BaAccounts: CollectionConfig = {
  slug: "ba-accounts",
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: "accountId", type: "text", required: true },
    { name: "providerId", type: "text", required: true },
    { name: "userId", type: "number", required: true, index: true },
    { name: "accessToken", type: "text" },
    { name: "refreshToken", type: "text" },
    { name: "accessTokenExpiresAt", type: "date" },
    { name: "refreshTokenExpiresAt", type: "date" },
    { name: "scope", type: "text" },
    { name: "password", type: "text" },
    { name: "idToken", type: "text" },
  ],
};
