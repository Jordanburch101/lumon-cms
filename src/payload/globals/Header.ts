import type { GlobalConfig } from "payload";
import { isAdminOrEditor } from "../access";
import { iconPicker } from "../fields/icon/icon";
import { link } from "../fields/link/link";
import { logoField } from "../fields/logo/logo";
import { revalidateGlobalOnChange } from "../hooks/revalidateGlobal";

export const Header: GlobalConfig = {
  slug: "header",
  label: "Header",
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateGlobalOnChange(["header"])],
  },
  fields: [
    logoField(),
    {
      name: "navItems",
      type: "blocks",
      label: "Nav Items",
      blocks: [
        {
          slug: "direct-link",
          labels: { singular: "Direct Link", plural: "Direct Links" },
          fields: [link({ required: true })],
        },
        {
          slug: "dropdown",
          labels: { singular: "Dropdown", plural: "Dropdowns" },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              label: "Label",
              admin: {
                description: "Text shown in the navbar (e.g. 'Resources')",
              },
            },
            {
              name: "items",
              type: "array",
              label: "Items",
              fields: [
                link({ required: true }),
                iconPicker(),
                {
                  name: "description",
                  type: "text",
                  label: "Description",
                  admin: {
                    description: "Short description shown below the link",
                  },
                },
              ],
            },
          ],
        },
        {
          slug: "mega-menu",
          labels: { singular: "Mega Menu", plural: "Mega Menus" },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
              label: "Label",
              admin: {
                description: "Text shown in the navbar (e.g. 'Divisions')",
              },
            },
            {
              name: "groups",
              type: "array",
              label: "Groups",
              fields: [
                {
                  name: "groupLabel",
                  type: "text",
                  required: true,
                  label: "Group Label",
                  admin: {
                    description: "Column heading (e.g. 'Core Operations')",
                  },
                },
                {
                  name: "items",
                  type: "array",
                  label: "Items",
                  fields: [
                    link({ required: true }),
                    iconPicker(),
                    {
                      name: "description",
                      type: "text",
                      label: "Description",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "cta",
      type: "group",
      label: "CTA Button",
      fields: [
        {
          name: "show",
          type: "checkbox",
          defaultValue: true,
          label: "Show CTA button",
        },
        link({
          required: false,
          appearance: {
            type: ["button"],
            button: {
              variants: ["default", "outline", "secondary"],
              sizes: ["sm", "default", "lg"],
            },
          },
        }),
      ],
    },
  ],
};
