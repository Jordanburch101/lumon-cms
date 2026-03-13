// src/payload/fields/link/linkable-collections.ts
export const linkableCollections = ["pages"] as const;
export type LinkableCollection = (typeof linkableCollections)[number];
