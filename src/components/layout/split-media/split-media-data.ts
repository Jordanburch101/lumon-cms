export interface SplitRow {
  body: string;
  cta?: {
    label: string;
    href: string;
  };
  headline: string;
  mediaAlt: string;
  mediaLabel: string;
  mediaOverlay: {
    badge: string;
    description: string;
    title: string;
  };
  mediaSrc: string;
}

export const splitMediaRows: SplitRow[] = [
  {
    headline: "Refining the work you were designed to do",
    body: "At Lumon, every detail of the severed floor is calibrated for focus. Our proprietary macrodata refinement process ensures your innies deliver results your outties can be proud of.",
    mediaLabel: "Process",
    mediaOverlay: {
      title: "Macrodata Refinement",
      badge: "Core",
      description:
        "Precise data categorization through intuitive pattern recognition.",
    },
    mediaSrc: "/hero-vid.mp4",
    mediaAlt: "Macrodata refinement process",
    cta: {
      label: "Learn more",
      href: "/about",
    },
  },
  {
    headline: "The Perpetuity Wing awaits",
    body: "Nine floors. Nine founders. A legacy preserved in wax and wonder. Every Lumon employee deserves to walk the halls that started it all.",
    mediaLabel: "Heritage",
    mediaOverlay: {
      title: "Perpetuity Wing",
      badge: "Landmark",
      description:
        "A tribute to the visionaries who built Lumon from the ground up.",
    },
    mediaSrc: "/split-vid-building.mp4",
    mediaAlt: "The Perpetuity Wing",
    cta: {
      label: "Take the tour",
      href: "/heritage",
    },
  },
  {
    headline: "Your outie loves the benefits",
    body: "Competitive compensation. Wellness sessions with Ms. Casey. Waffle parties for top performers. Lumon takes care of its people — all of them.",
    mediaLabel: "Culture",
    mediaOverlay: {
      title: "Employee Wellness",
      badge: "Benefits",
      description:
        "Programs designed to nurture every aspect of the Lumon experience.",
    },
    mediaSrc: "/split-vid-hana.mp4",
    mediaAlt: "Lumon employee benefits",
    cta: {
      label: "View careers",
      href: "/careers",
    },
  },
];
