import type { Block } from "payload";
import { link } from "../fields/link/link";

export const JobListingsBlock: Block = {
  slug: "jobListings",
  labels: { singular: "Job Listings", plural: "Job Listings" },
  admin: {
    description:
      "Job posting list with title, department, location, employment type, optional salary, description, and apply link. Use for careers or hiring pages.",
  },
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "jobs",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "department", type: "text", required: true },
        { name: "location", type: "text", required: true },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Full-time", value: "full-time" },
            { label: "Part-time", value: "part-time" },
            { label: "Contract", value: "contract" },
            { label: "Internship", value: "internship" },
          ],
        },
        { name: "salary", type: "text" },
        { name: "description", type: "textarea" },
        link({
          name: "link",
          required: true,
          appearance: {
            type: ["button"],
            button: {
              variants: ["default", "outline"],
              sizes: ["default", "lg"],
            },
          },
        }),
      ],
    },
  ],
};
