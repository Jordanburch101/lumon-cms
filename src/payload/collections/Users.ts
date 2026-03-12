import type { CollectionConfig } from "payload";
import { adminFieldOnly, isAdmin, isAdminOrSelf, isLoggedIn } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    read: isLoggedIn,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "guest",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Guest", value: "guest" },
      ],
      access: {
        update: adminFieldOnly,
      },
      admin: {
        position: "sidebar",
      },
    },
  ],
};
