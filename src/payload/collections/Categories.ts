import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import { isAdminOrEditor } from "../access";
import { revalidateOnChange } from "../hooks/revalidateOnChange";

const { afterChange, afterDelete } = revalidateOnChange();

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "Blog",
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    slugField({ useAsSlug: "title" }),
  ],
};
