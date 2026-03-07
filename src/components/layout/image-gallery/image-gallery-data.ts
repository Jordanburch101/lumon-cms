export interface GalleryItem {
  caption: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  label: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "elevator-descent",
    label: "The Severed Floor",
    caption: "The elevator arrives. The work begins.",
    imageSrc: "/gallery/elevator-descent.jpg",
    imageAlt:
      "Mark Scout standing in the elevator descending to the severed floor",
  },
  {
    id: "break-room-session",
    label: "The Break Room",
    caption: "Forgive me for what I have done to the children of Kier.",
    imageSrc: "/gallery/break-room-session.jpg",
    imageAlt: "A woman reading the break room statement at a glowing terminal",
  },
  {
    id: "the-you-you-are",
    label: "The You You Are",
    caption: "Every person is a book, waiting to be read.",
    imageSrc: "/gallery/the-you-you-are.jpg",
    imageAlt: "Irving holding a copy of The You You Are",
  },
  {
    id: "macrodata-refinement",
    label: "Macrodata Refinement",
    caption: "The numbers are unknowable. The work is not.",
    imageSrc: "/gallery/macrodata-refinement.jpg",
    imageAlt: "Helly seated at her desk in the Macrodata Refinement office",
  },
  {
    id: "mdr-team",
    label: "The Refiners",
    caption: "Four innies. One department. No answers.",
    imageSrc: "/gallery/mdr-team.jpg",
    imageAlt:
      "The MDR team gathered together in the office with Milchick observing",
  },
  {
    id: "helly-portrait",
    label: "Helly R.",
    caption: "I am a person. You are not.",
    imageSrc: "/gallery/helly-portrait.jpg",
    imageAlt: "Helly peering over a cubicle divider on the severed floor",
  },
];
