/**
 * Block fixtures — sample props for every block type.
 *
 * Used by .storybook/generate.ts to auto-generate stories.
 * When adding a new block:
 *   1. Register it in render-blocks.tsx (you already do this)
 *   2. Add a fixture entry here with sample props
 *   3. Stories appear automatically on next `bun storybook`
 */

// Mock media helper — creates a fake Media object that works with getMediaUrl()
const mockMedia = (alt: string, w = 800, h = 600) => ({
  id: 1,
  alt,
  url: `https://placehold.co/${w}x${h}/1a1a2e/ffffff?text=${encodeURIComponent(alt)}`,
  filename: `${alt.toLowerCase().replace(/\s+/g, "-")}.webp`,
  width: w,
  height: h,
  mimeType: "image/webp",
});

// Mock CTA helper
const mockCta = (
  label: string,
  variant: "default" | "outline" = "default"
) => ({
  type: "external" as const,
  url: "#",
  label,
  appearanceType: "button" as const,
  buttonVariant: variant,
  buttonSize: "lg" as const,
});

export const blockFixtures: Record<string, Record<string, unknown>> = {
  // ─── Hero Blocks ───────────────────────────────
  hero: {
    blockType: "hero",
    mediaSrc: mockMedia("Hero Background", 1920, 1080),
    headline: "Welcome to Lumon Industries",
    subtext: "A better you, through the severance procedure.",
    primaryCta: mockCta("Get Started"),
    secondaryCta: mockCta("Learn More", "outline"),
  },

  heroCentered: {
    blockType: "heroCentered",
    mediaSrc: mockMedia("Hero Centered Background", 1920, 1080),
    headline: "The work is mysterious and important",
    subtext: "Your outie has made a commitment. Your innie will honor it.",
    primaryCta: mockCta("Begin Session"),
    secondaryCta: mockCta("View Protocol", "outline"),
  },

  heroMinimal: {
    blockType: "heroMinimal",
    headline: "The Board thanks you",
    subtext:
      "Your continued compliance with severance protocol has been recognized. Please enjoy the perplex you have earned.",
    primaryCta: mockCta("Acknowledge"),
    secondaryCta: mockCta("View Protocol", "outline"),
  },

  heroStats: {
    blockType: "heroStats",
    headline: "Macrodata Refinement",
    subtext:
      "Your outie has been informed of these results. All metrics reflect quarterly performance data as verified by the Board.",
    stats: [
      { id: "s1", value: "97.3", label: "Wellness Score" },
      { id: "s2", value: "4.2k", label: "Files Refined" },
      { id: "s3", value: "12", label: "Departments" },
      { id: "s4", value: "99.8%", label: "Uptime" },
    ],
    primaryCta: mockCta("Access Dashboard"),
    secondaryCta: mockCta("Department Brief", "outline"),
  },

  // ─── Content Blocks ────────────────────────────
  featuresGrid: {
    blockType: "featuresGrid",
    eyebrow: "Core Capabilities",
    heading: "Refined for operational excellence",
    description:
      "Each module has been designed to the Board's exacting specifications.",
    items: [
      {
        id: "f1",
        icon: "layers",
        label: "Module 01",
        heading: "Data Refinement",
        description:
          "Sort numbers into bins based on how they make you feel. The purpose is classified.",
      },
      {
        id: "f2",
        icon: "shieldCheck",
        label: "Module 02",
        heading: "Wellness Monitoring",
        description:
          "Continuous evaluation of employee wellbeing through approved measurement protocols.",
      },
      {
        id: "f3",
        icon: "lightning",
        label: "Module 03",
        heading: "Perpetuity Wing",
        description:
          "A curated collection of artifacts documenting Kier Eagan's enduring vision for humanity.",
      },
    ],
  },

  bento: {
    blockType: "bento",
    headline: "Everything you need",
    subtext: "A complete platform for severed floor operations.",
    image: {
      src: mockMedia("Bento Image", 600, 400),
      alt: "Dashboard preview",
      title: "MDR Dashboard",
      description: "Real-time monitoring of macrodata refinement progress.",
      badge: "New",
    },
    chartData: [
      { month: "Jan", visitors: 120 },
      { month: "Feb", visitors: 180 },
      { month: "Mar", visitors: 250 },
      { month: "Apr", visitors: 310 },
      { month: "May", visitors: 420 },
      { month: "Jun", visitors: 380 },
    ],
  },

  splitMedia: {
    blockType: "splitMedia",
    rows: [
      {
        id: "r1",
        headline: "Designed for compliance",
        body: "Every interaction has been approved by the Board. Deviation is not possible.",
        mediaSrc: mockMedia("Split Media", 800, 600),
        mediaAlt: "Office corridor",
        mediaLabel: "Severed Floor",
      },
    ],
  },

  testimonials: {
    blockType: "testimonials",
    headline: "Voices from the severed floor",
    subtext: "What our innies are saying about the refinement process.",
    testimonials: [
      {
        id: "t1",
        name: "Mark Scout",
        role: "Department Chief",
        department: "MDR",
        quote:
          "The work is mysterious and important. I find great satisfaction in not knowing what it means.",
        featured: true,
        featuredQuote:
          "Every day I wake up on that table and I choose to be here. Or at least, my outie chose for me.",
      },
      {
        id: "t2",
        name: "Helly Riggs",
        role: "Refiner",
        department: "MDR",
        quote:
          "I have questions about the process that I am not permitted to ask.",
      },
      {
        id: "t3",
        name: "Irving Bailiff",
        role: "Refiner",
        department: "MDR",
        quote:
          "The handbook is clear. Compliance is not optional, it is the foundation of our purpose.",
      },
    ],
  },

  imageGallery: {
    blockType: "imageGallery",
    items: [
      {
        id: "ig1",
        label: "Perpetuity Wing",
        caption: "A tribute to Kier Eagan's enduring vision.",
        image: mockMedia("Gallery 1", 800, 600),
        imageAlt: "Perpetuity Wing",
      },
      {
        id: "ig2",
        label: "Break Room",
        caption: "For reflection and recalibration.",
        image: mockMedia("Gallery 2", 800, 600),
        imageAlt: "Break Room",
      },
      {
        id: "ig3",
        label: "Wellness Center",
        caption: "Your wellbeing is the Board's priority.",
        image: mockMedia("Gallery 3", 800, 600),
        imageAlt: "Wellness Center",
      },
    ],
  },

  latestArticles: {
    blockType: "latestArticles",
    headline: "From the severed floor",
    subtext: "The latest dispatches from Lumon Industries.",
    articles: [
      {
        id: "a1",
        title: "Q4 Refinement Metrics Exceed Projections",
        excerpt:
          "The Board is pleased to announce that departmental output has surpassed quarterly targets.",
        category: "Reports",
        image: mockMedia("Article 1", 600, 400),
        imageAlt: "Quarterly report",
        href: "#",
        publishedAt: "2026-03-01",
        readTime: "4 min",
        author: {
          name: "Harmony Cobel",
          avatar: mockMedia("HC", 100, 100),
        },
      },
      {
        id: "a2",
        title: "New Wellness Protocol Approved",
        excerpt:
          "Enhanced measurement protocols ensure continued employee satisfaction.",
        category: "Announcements",
        image: mockMedia("Article 2", 600, 400),
        imageAlt: "Wellness protocol",
        href: "#",
        publishedAt: "2026-02-15",
        readTime: "3 min",
        author: {
          name: "Seth Milchick",
          avatar: mockMedia("SM", 100, 100),
        },
      },
    ],
  },

  cinematicCta: {
    blockType: "cinematicCta",
    videoSrc: mockMedia("CTA Video", 1920, 1080),
    label: "Interdepartmental Notice",
    headline: "Your outie is grateful",
    subtext:
      "The severance procedure is permanent, voluntary, and irreversible.",
    cta: mockCta("Apply Now"),
  },

  // ─── CTA Blocks ────────────────────────────────
  ctaBand: {
    blockType: "ctaBand",
    variant: "primary",
    heading: "Your department requires your attention",
    subtext:
      "The Board has scheduled a mandatory wellness session. Please report to your assigned floor.",
    primaryCta: mockCta("Begin Session"),
    secondaryCta: mockCta("Report Issue", "outline"),
  },

  // ─── Social Proof ──────────────────────────────
  pricing: {
    blockType: "pricing",
    headline: "Severance packages",
    subtext: "Choose the procedure that's right for your outie.",
    tiers: [
      {
        id: "p1",
        name: "Standard",
        description: "For individual contributors",
        monthlyPrice: 49,
        annualPrice: 39,
        features: [
          { id: "pf1", text: "Basic data refinement" },
          { id: "pf2", text: "Quarterly wellness checks" },
          { id: "pf3", text: "Break room access" },
        ],
        cta: mockCta("Get Started"),
      },
      {
        id: "p2",
        name: "Department",
        description: "For team leads and department chiefs",
        monthlyPrice: 99,
        annualPrice: 79,
        recommended: true,
        badge: "Most Popular",
        features: [
          { id: "pf4", text: "Advanced data refinement" },
          { id: "pf5", text: "Weekly wellness checks" },
          { id: "pf6", text: "Perpetuity Wing access" },
          { id: "pf7", text: "Waffle party eligibility" },
        ],
        cta: mockCta("Get Started"),
      },
    ],
  },

  faq: {
    blockType: "faq",
    eyebrow: "Questions",
    headline: "Frequently asked questions",
    subtext: "Everything your innie needs to know.",
    items: [
      {
        id: "fq1",
        question: "What is the severance procedure?",
        answer:
          "The severance procedure creates a partition in the mind, separating work memories from personal memories. Your outie will not remember anything from the severed floor.",
      },
      {
        id: "fq2",
        question: "Can the procedure be reversed?",
        answer:
          "The severance procedure is permanent and irreversible. This has been approved by the Board.",
      },
      {
        id: "fq3",
        question: "What are the perks?",
        answer:
          "Eligible innies may receive waffle parties, music dance experiences, finger traps, and other Board-approved incentives.",
      },
    ],
  },

  team: {
    blockType: "team",
    eyebrow: "Department Personnel",
    heading: "Macrodata Refinement",
    description:
      "Your outie selected you for this role. The Board is grateful.",
    variant: "detailed",
    members: [
      {
        id: "m1",
        name: "Mark Scout",
        role: "Department Chief",
        department: "MDR",
        photo: mockMedia("Mark Scout", 400, 533),
      },
      {
        id: "m2",
        name: "Helly Riggs",
        role: "Refiner",
        department: "MDR",
        photo: mockMedia("Helly Riggs", 400, 533),
      },
      {
        id: "m3",
        name: "Irving Bailiff",
        role: "Refiner",
        department: "MDR",
        photo: mockMedia("Irving Bailiff", 400, 533),
      },
      {
        id: "m4",
        name: "Dylan George",
        role: "Refiner",
        department: "MDR",
        photo: mockMedia("Dylan George", 400, 533),
      },
    ],
  },

  trust: {
    blockType: "trust",
    eyebrow: "Trusted worldwide",
    stats: [
      { id: "ts1", label: "Departments", value: 12, format: "none" },
      { id: "ts2", label: "Innies Severed", value: 4200, format: "k" },
      {
        id: "ts3",
        label: "Compliance Rate",
        value: 99.8,
        decimals: 1,
        suffix: "%",
      },
    ],
  },

  logoCloud: {
    blockType: "logoCloud",
    eyebrow: "Trusted by departments worldwide",
    variant: "grid",
    logos: [
      {
        id: "l1",
        logo: mockMedia("Lumon", 200, 80),
        name: "Lumon Industries",
      },
      { id: "l2", logo: mockMedia("Eagan", 200, 80), name: "Eagan Corp" },
      {
        id: "l3",
        logo: mockMedia("Myrtle", 200, 80),
        name: "Myrtle Systems",
      },
      {
        id: "l4",
        logo: mockMedia("O&D", 200, 80),
        name: "Optics & Design",
      },
      {
        id: "l5",
        logo: mockMedia("Mammalians", 200, 80),
        name: "Mammalians Nurturable",
      },
    ],
  },

  richTextContent: {
    blockType: "richTextContent",
    maxWidth: "prose",
    content: {
      root: {
        type: "root",
        children: [
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "The Handbook of Kier" }],
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "The four tempers — Woe, Frolic, Dread, and Malice — must be kept in balance. This is the foundation of all refinement work.",
              },
            ],
          },
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Render not my creation in miniature. What I have built, I have built at scale.",
              },
            ],
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      },
    },
  },
};
