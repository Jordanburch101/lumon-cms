export interface GalleryItem {
  caption: string;
  id: string;
  imageAlt: string;
  imageSrc: string;
  label: string;
}

export const galleryItems: GalleryItem[] = [
  {
    id: "severed-floor",
    label: "Severed Floor",
    caption: "The elevator arrives. The work begins.",
    imageSrc: "/hero-bg.jpg",
    imageAlt: "The long fluorescent-lit corridor of the severed floor",
  },
  {
    id: "macrodata-refinement",
    label: "Macrodata Refinement",
    caption: "The numbers are unknowable. The work is not.",
    imageSrc: "/hero-bg.jpg",
    imageAlt: "The MDR office with terminals and refiners at work",
  },
  {
    id: "break-room",
    label: "The Break Room",
    caption: "Forgive me for what I have done to the children of Kier.",
    imageSrc: "/hero-bg.jpg",
    imageAlt: "The stark break room with a single chair and speaker",
  },
  {
    id: "perpetuity-wing",
    label: "Perpetuity Wing",
    caption: "Nine founders. Nine lives. Preserved in wax and wonder.",
    imageSrc: "/hero-bg.jpg",
    imageAlt: "Wax figures of the Eagan founders in the Perpetuity Wing",
  },
  {
    id: "the-board",
    label: "The Board",
    caption: "The Board thanks you for your service.",
    imageSrc: "/hero-bg.jpg",
    imageAlt: "A dark, minimal conference space",
  },
];
