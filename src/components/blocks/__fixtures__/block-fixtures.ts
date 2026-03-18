/**
 * Block fixtures — sample props for every block type.
 *
 * Types flow directly from Payload's generated types (payload-types.ts → block-types.ts).
 * This means TypeScript will catch missing required fields, typos, and invalid values.
 *
 * Used by .storybook/generate.ts to auto-generate stories.
 * When adding a new block:
 *   1. Register it in render-blocks.tsx (you already do this)
 *   2. Add a fixture entry here with sample props — TypeScript guides you
 *   3. Stories appear automatically on next `bun storybook`
 */

import type { ExtractBlock, LayoutBlock } from "@/types/block-types";

/**
 * Mapped type: one fixture per blockType, typed against Payload's generated schema.
 * Uses DeepPartial so nested arrays/objects don't require every optional field,
 * but top-level required fields (headline, blockType, etc.) are still enforced.
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type BlockFixtures = {
  [K in LayoutBlock["blockType"]]: DeepPartial<ExtractBlock<K>> & {
    blockType: K;
  };
};

// Mock media helper — creates a fake Media object that works with getMediaUrl()
// Uses picsum.photos with seeded URLs for consistent images across builds
let mediaIdCounter = 1;
const mockMedia = (seed: string, w = 800, h = 600) => ({
  id: mediaIdCounter++,
  alt: seed,
  url: `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`,
  filename: `${seed.toLowerCase().replace(/\s+/g, "-")}.webp`,
  width: w,
  height: h,
  mimeType: "image/webp",
});

// Mock portrait helper — uses randomuser.me for realistic team/author photos
const mockPortrait = (
  name: string,
  gender: "men" | "women",
  index: number
) => ({
  id: index + 100,
  alt: name,
  url: `https://randomuser.me/api/portraits/${gender}/${index}.jpg`,
  filename: `${name.toLowerCase().replace(/\s+/g, "-")}.jpg`,
  width: 400,
  height: 400,
  mimeType: "image/jpeg",
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

/**
 * ArgTypes — Storybook control definitions matching Payload field types.
 *
 * Maps blockType → field → control config. Only fields that need explicit
 * controls are listed here. Simple strings/numbers get auto-detected.
 * See: https://storybook.js.org/docs/api/arg-types
 */
export const blockArgTypes: Record<string, Record<string, unknown>> = {
  ctaBand: {
    variant: {
      control: "select",
      options: ["primary", "card"],
      description: "Visual style — primary (solid bg) or card (bordered)",
    },
  },
  logoCloud: {
    variant: {
      control: "select",
      options: ["scroll", "grid"],
      description: "Layout — scrolling row or featured grid",
    },
  },
  team: {
    variant: {
      control: "select",
      options: ["detailed", "compact"],
      description: "Card style — detailed (with bio/links) or compact",
    },
  },
  richTextContent: {
    maxWidth: {
      control: "select",
      options: ["narrow", "default", "wide"],
      description: "Content width constraint",
    },
  },
  statsBar: {
    variant: {
      control: "select",
      options: ["default", "card", "minimal"],
      description:
        "Visual style — default (dividers), card (individual cards), minimal (no borders)",
    },
  },
  // Text fields, arrays, and nested objects get auto-detected controls
  // from the fixture values — no need to list them here
};

export const blockFixtures: BlockFixtures = {
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
    headline: "Build without limits.",
    subtext:
      "A Next.js + Payload CMS template designed for teams who ship. Everything you need, nothing you don't.",
    primaryCta: mockCta("Get Started"),
    secondaryCta: mockCta("View on GitHub", "outline"),
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
    headline: "Everything you need, ready to ship",
    subtext:
      "A complete design system with production-grade components. Charts, forms, theming, and more — all wired up and ready to go.",
    image: {
      src: mockMedia("Bento Image", 600, 400),
      alt: "Dashboard preview",
      title: "MDR Dashboard",
      description: "Real-time monitoring of macrodata refinement progress.",
      badge: "New",
    },
    showcase: {
      src: mockMedia("Bento Showcase Video", 800, 450),
      alt: "Visual storytelling showcase",
      title: "Visual Storytelling",
      description:
        "Full-bleed video and image blocks that bring your brand to life.",
      badge: "Cinematic",
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
        headline: "Refining the work you were designed to do",
        body: "At Lumon, every detail of the severed floor is calibrated for focus. Our proprietary macrodata refinement process ensures your innies deliver results your outies can be proud of.",
        mediaSrc: mockMedia("split-office", 800, 600),
        mediaAlt: "Office corridor",
        mediaLabel: "Process",
        mediaOverlay: {
          title: "Macrodata Refinement",
          badge: "Core",
          description:
            "Precise data categorization through intuitive pattern recognition.",
        },
      },
      {
        id: "r2",
        headline: "The Perpetuity Wing awaits",
        body: "Nine floors. Nine founders. A legacy preserved in wax and wonder. Every Lumon employee deserves to walk the halls that started it all.",
        mediaSrc: mockMedia("split-workspace", 800, 600),
        mediaAlt: "Workspace interior",
        mediaLabel: "Heritage",
        mediaOverlay: {
          title: "Perpetuity Wing",
          badge: "Landmark",
          description:
            "A tribute to the visionaries who built Lumon from the ground up.",
        },
      },
      {
        id: "r3",
        headline: "Your outie loves the benefits",
        body: "Competitive compensation. Wellness sessions with Ms. Casey. Waffle parties for top performers. Lumon takes care of its people — all of them.",
        mediaSrc: mockMedia("split-benefits", 800, 600),
        mediaAlt: "Employee benefits",
        mediaLabel: "Culture",
        mediaOverlay: {
          title: "Employee Wellness",
          badge: "Benefits",
          description:
            "Programs designed to nurture every aspect of the Lumon experience.",
        },
      },
    ],
  },

  testimonials: {
    blockType: "testimonials",
    headline: "Praise from the severed floor",
    subtext:
      "Every department. Every disposition. One unified appreciation for the work.",
    testimonials: [
      {
        id: "t1",
        name: "Harmony Cobel",
        role: "Director, Severed Floor",
        quote:
          "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce — and I see everything.",
        featured: true,
        featuredQuote:
          "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce — and I see everything.",
      },
      {
        id: "t2",
        name: "Mark S.",
        department: "MDR",
        quote: "I enjoy every moment of my work day. I have no reason not to.",
      },
      {
        id: "t3",
        name: "Helly R.",
        department: "MDR",
        quote: "I am grateful for the opportunity to serve Kier's vision.",
      },
      {
        id: "t4",
        name: "Irving B.",
        department: "MDR",
        quote: "The handbook says to find meaning in the work itself. I have.",
      },
      {
        id: "t5",
        name: "Dylan G.",
        department: "MDR",
        quote:
          "The incentives are real and the waffle parties are worth every bin.",
      },
    ],
  },

  imageGallery: {
    blockType: "imageGallery",
    items: [
      {
        id: "ig1",
        label: "The Severed Floor",
        caption: "The elevator arrives. The work begins.",
        image: mockMedia("Gallery 1", 800, 600),
        imageAlt: "The Severed Floor",
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
    headline: "Latest from the blog",
    subtext:
      "Insights, updates, and dispatches from the severed floor and beyond.",
    articles: [
      {
        id: "a1",
        title:
          "Understanding the Severance Protocol: A New Era of Work-Life Balance",
        category: "Research",
        image: mockMedia("Article 1", 600, 400),
        imageAlt: "Severance protocol research",
        href: "#",
        publishedAt: "2026-03-01",
        readTime: "4 min",
        author: {
          name: "Harmony Cobel",
          avatar: mockPortrait("Harmony Cobel", "women", 65),
        },
      },
      {
        id: "a2",
        title: "Inside the Waffle Party: Lumon's Most Coveted Incentive",
        excerpt:
          "What makes the waffle party the ultimate reward? We explore the history, the ritual, and why top refiners will do anything to earn one.",
        category: "Culture",
        image: mockMedia("Article 2", 600, 400),
        imageAlt: "Waffle party",
        href: "#",
        publishedAt: "2026-02-22",
        readTime: "3 min",
        author: {
          name: "Seth Milchick",
          avatar: mockPortrait("Seth Milchick", "men", 52),
        },
      },
    ],
  },

  cinematicCta: {
    blockType: "cinematicCta",
    // Note: this is an image URL, not a real video — the <video> element won't play
    // but the layout and overlay render correctly for visual testing
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
    headline: "Choose your Severance Package",
    subtext:
      "Each tier has been carefully calibrated by the Board to maximize your contribution to the work.",
    footnote: "The work is mysterious and important.",
    footnoteAttribution: "Kier Eagan",
    tiers: [
      {
        id: "p1",
        name: "Innie",
        description: "Begin your journey on the severed floor.",
        monthlyPrice: 0,
        annualPrice: 0,
        features: [
          { id: "pf1", text: "Macrodata access (read-only)" },
          { id: "pf2", text: "Standard break allowance" },
          { id: "pf3", text: "Handbook chapters 1–3" },
          { id: "pf4", text: "Shared perpetuity wing access" },
          { id: "pf5", text: "Basic wellness check" },
        ],
        cta: mockCta("Begin Orientation"),
      },
      {
        id: "p2",
        name: "Refined",
        description: "Full access to the work and its rewards.",
        monthlyPrice: 49,
        annualPrice: 39,
        recommended: true,
        badge: "Most Popular",
        features: [
          { id: "pf6", text: "Everything in Innie" },
          { id: "pf7", text: "Full refinement capabilities" },
          { id: "pf8", text: "Priority waffle party queue" },
          { id: "pf9", text: "Music-dance experience (monthly)" },
          { id: "pf10", text: "Dedicated supervisor" },
          { id: "pf11", text: "Egg bar access" },
        ],
        cta: mockCta("Begin Refinement"),
      },
      {
        id: "p3",
        name: "Perpetuity",
        description: "For those who give everything to Kier's vision.",
        monthlyPrice: 199,
        annualPrice: 159,
        features: [
          { id: "pf12", text: "Everything in Refined" },
          { id: "pf13", text: "Unlimited department transfers" },
          { id: "pf14", text: "Private wellness sessions" },
          { id: "pf15", text: "Board-level analytics" },
          { id: "pf16", text: "Revolving (unlimited) incentives" },
          { id: "pf17", text: "Custom orientation protocol" },
        ],
        cta: mockCta("Contact the Board"),
      },
    ],
  },

  faq: {
    blockType: "faq",
    eyebrow: "Your outie has been informed of these answers",
    headline: "Frequently Asked Questions",
    subtext:
      "The Board has pre-approved the following responses. Additional inquiries may be directed to your floor supervisor.",
    ctaText: "Still have questions?",
    cta: {
      type: "external" as const,
      url: "#",
      label: "Contact your floor supervisor",
    },
    items: [
      {
        id: "fq1",
        question: "What happens during the severance procedure?",
        answer:
          "The procedure involves a minor surgical implant that creates a partition in the mind. Your work memories and personal memories are kept entirely separate. The process is quick, outpatient, and Board-approved.",
      },
      {
        id: "fq2",
        question: "Can I contact my innie?",
        answer:
          "Direct communication between your innie and outie is not permitted under Lumon protocol. However, your outie will receive quarterly performance summaries via interdepartmental mail.",
      },
      {
        id: "fq3",
        question: "What is Macrodata Refinement?",
        answer:
          "Macrodata Refinement (MDR) is the process of sorting numbers into bins based on how they make you feel. The purpose of the work is classified, but the Board assures you it is important.",
      },
      {
        id: "fq4",
        question: "How are incentives determined?",
        answer:
          "Incentives are awarded based on departmental output and individual compliance scores. Top performers may earn waffle parties, music-dance experiences, finger traps, or coveted egg bar visits.",
      },
      {
        id: "fq5",
        question: "What is a waffle party?",
        answer:
          "The waffle party is Lumon's premier incentive experience. Details are confidential, but participants describe it as 'transformative.' Eligibility requires sustained excellence in refinement quotas.",
      },
      {
        id: "fq6",
        question: "Can the severance procedure be reversed?",
        answer:
          "The severance procedure is permanent and irreversible. This has been approved by the Board. Please direct any concerns to your floor supervisor.",
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
        bio: "Leads the Macrodata Refinement team with quiet resolve. His outie chose this path, and his innie walks it dutifully.",
        photo: mockPortrait("Mark Scout", "men", 32),
        links: [
          { id: "ml1", platform: "linkedin", url: "#" },
          { id: "ml2", platform: "github", url: "#" },
        ],
      },
      {
        id: "m2",
        name: "Helly Riggs",
        role: "Refiner",
        department: "MDR",
        bio: "The newest member of the MDR team. Adjusting to the severance procedure with characteristic determination.",
        photo: mockPortrait("Helly Riggs", "women", 44),
        links: [{ id: "ml3", platform: "twitter", url: "#" }],
      },
      {
        id: "m3",
        name: "Irving Bailiff",
        role: "Refiner",
        department: "MDR",
        bio: "A devoted adherent to the teachings of Kier Eagan. Believes deeply in the handbook and its principles.",
        photo: mockPortrait("Irving Bailiff", "men", 67),
        links: [{ id: "ml4", platform: "website", url: "#" }],
      },
      {
        id: "m4",
        name: "Dylan George",
        role: "Refiner",
        department: "MDR",
        photo: mockPortrait("Dylan George", "men", 15),
      },
    ],
  },

  trust: {
    blockType: "trust",
    eyebrow: "Your outie has been informed of these results",
    stats: [
      { id: "ts1", label: "Refined Files", value: 847_000, format: "k" },
      {
        id: "ts2",
        label: "Severance Uptime",
        value: 99.7,
        decimals: 1,
        suffix: "%",
      },
      { id: "ts3", label: "Wellness Score", value: 9.8, decimals: 1 },
      { id: "ts4", label: "Departments", value: 16, suffix: "+" },
    ],
    logos: [
      {
        id: "tl1",
        logo: mockMedia("Acme", 200, 80),
        name: "Acme",
      },
      {
        id: "tl2",
        logo: mockMedia("Globex", 200, 80),
        name: "Globex",
      },
      {
        id: "tl3",
        logo: mockMedia("Initech", 200, 80),
        name: "Initech",
      },
      {
        id: "tl4",
        logo: mockMedia("Hooli", 200, 80),
        name: "Hooli",
      },
      {
        id: "tl5",
        logo: mockMedia("Umbrella", 200, 80),
        name: "Umbrella",
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
    maxWidth: "default",
    content: {
      root: {
        type: "root",
        children: [
          // ─── H2 heading ────────────────────────────
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "The Handbook of Kier" }],
          },

          // ─── Paragraph with inline formatting ──────
          // format bitmask: 1=bold, 2=italic, 3=bold+italic, 4=strikethrough, 8=underline, 16=code, 32=subscript, 64=superscript
          {
            type: "paragraph",
            children: [
              { type: "text", text: "The " },
              { type: "text", text: "four tempers", format: 1 },
              {
                type: "text",
                text: " — Woe, Frolic, Dread, and Malice — must be kept in balance. This is the ",
              },
              { type: "text", text: "foundation", format: 2 },
              { type: "text", text: " of all refinement work. The " },
              { type: "text", text: "severance procedure", format: 8 },
              { type: "text", text: " is " },
              { type: "text", text: "permanent", format: 4 },
              { type: "text", text: " irreversible. Section " },
              { type: "text", text: "4.7(a)", format: 16 },
              { type: "text", text: " of the handbook applies." },
            ],
          },

          // ─── H3 subheading ─────────────────────────
          {
            type: "heading",
            tag: "h3",
            children: [{ type: "text", text: "Core Principles of Severance" }],
          },

          // ─── Regular paragraph with link ───────────
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "Render not my creation in miniature. What I have built, I have built at scale. For more guidance, consult the ",
              },
              {
                type: "link",
                url: "#",
                children: [{ type: "text", text: "Compliance Handbook" }],
              },
              {
                type: "text",
                text: " or speak with your department chief.",
              },
            ],
          },

          // ─── Callout block: info ───────────────────
          {
            type: "block",
            fields: {
              blockType: "callout",
              variant: "info",
              title: "Important Notice",
              content:
                "All innies must complete their quarterly wellness assessment by end of day Friday. Failure to comply will result in a mandatory visit to the Break Room.",
            },
          },

          // ─── Unordered list ────────────────────────
          {
            type: "list",
            tag: "ul",
            listType: "bullet",
            children: [
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "Compliance is not a suggestion — it is the architecture of purpose",
                  },
                ],
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "The severed floor is a sanctuary, not a workplace",
                  },
                ],
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "Your outie has chosen this path — your innie will walk it",
                  },
                ],
              },
            ],
          },

          // ─── Callout block: warning ────────────────
          {
            type: "block",
            fields: {
              blockType: "callout",
              variant: "warning",
              title: "Restricted Area",
              content:
                "Access to the Perpetuity Wing is limited to authorized personnel. Unauthorized entry will be reported to the Board.",
            },
          },

          // ─── Ordered list ──────────────────────────
          {
            type: "list",
            tag: "ol",
            listType: "number",
            children: [
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "Report to the severed floor at your scheduled time",
                  },
                ],
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "Complete your refinement quota before break",
                  },
                ],
              },
              {
                type: "listitem",
                children: [
                  {
                    type: "text",
                    text: "Submit your wellness assessment by end of shift",
                  },
                ],
              },
            ],
          },

          // ─── Checklist ─────────────────────────────
          {
            type: "list",
            tag: "ul",
            listType: "check",
            children: [
              {
                type: "listitem",
                checked: true,
                children: [
                  { type: "text", text: "Attend morning orientation" },
                ],
              },
              {
                type: "listitem",
                checked: true,
                children: [
                  { type: "text", text: "Review departmental protocols" },
                ],
              },
              {
                type: "listitem",
                checked: false,
                children: [
                  {
                    type: "text",
                    text: "Complete macrodata refinement training",
                  },
                ],
              },
              {
                type: "listitem",
                checked: false,
                children: [{ type: "text", text: "Schedule wellness session" }],
              },
            ],
          },

          // ─── Horizontal rule ───────────────────────
          { type: "horizontalrule" },

          // ─── Blockquote ────────────────────────────
          {
            type: "quote",
            children: [
              {
                type: "text",
                text: "The you you are is not the you they see. The you they see is the you you are to them. And that is a beautiful thing.",
                format: 2,
              },
            ],
          },

          // ─── Rich text media block ─────────────────
          {
            type: "block",
            fields: {
              blockType: "richTextMedia",
              mediaSrc: mockMedia("rich-text-media", 1200, 675),
              caption: "The severed floor — Lumon Industries, Kier, PE",
              credit: "Lumon Archives",
              creditUrl: "#",
              size: "large",
              alignment: "center",
              rounded: true,
            },
          },

          // ─── H4 subheading ─────────────────────────
          {
            type: "heading",
            tag: "h4",
            children: [{ type: "text", text: "Departmental Procedures" }],
          },

          // ─── Callout block: tip ────────────────────
          {
            type: "block",
            fields: {
              blockType: "callout",
              variant: "tip",
              title: "Pro Tip",
              content:
                "If the numbers feel scary, try to remember: they are just as afraid of you as you are of them.",
            },
          },

          // ─── Accordion block ───────────────────────
          {
            type: "block",
            fields: {
              blockType: "accordion",
              items: [
                {
                  title: "What is Macrodata Refinement?",
                  content:
                    "Macrodata Refinement (MDR) is the process of sorting numbers into bins based on how they make you feel. The purpose of the work is classified.",
                },
                {
                  title: "What are the four tempers?",
                  content:
                    "The four tempers are Woe, Frolic, Dread, and Malice. Each number you encounter will evoke one of these feelings. Sort accordingly.",
                },
                {
                  title: "What happens in the Break Room?",
                  content:
                    "The Break Room is a space for reflection and recalibration. You will be asked to read a statement aloud until it is believed.",
                },
              ],
            },
          },

          // ─── Button block ──────────────────────────
          {
            type: "block",
            fields: {
              blockType: "richTextButton",
              link: {
                type: "external",
                url: "#",
                label: "Begin Severance Procedure",
                appearanceType: "button",
                buttonVariant: "default",
                buttonSize: "lg",
              },
            },
          },

          // ─── Embed block ───────────────────────────
          {
            type: "block",
            fields: {
              blockType: "embed",
              url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              aspectRatio: "16:9",
              maxWidth: "large",
            },
          },

          // ─── Callout block: error ──────────────────
          {
            type: "block",
            fields: {
              blockType: "callout",
              variant: "error",
              title: "Violation Detected",
              content:
                "Your recent behavior has been flagged for review. A representative from Optics & Design will visit your workstation shortly.",
            },
          },

          // ─── Code block ────────────────────────────
          {
            type: "code",
            language: "typescript",
            children: [
              {
                type: "text",
                // biome-ignore lint/suspicious/noTemplateCurlyInString: this is code content, not a template literal
                text: 'const tempers = ["Woe", "Frolic", "Dread", "Malice"];\n\nfunction refine(number: number): string {\n  const feeling = tempers[number % 4];\n  return `Sorted to bin: ${feeling}`;\n}',
              },
            ],
          },

          // ─── Paragraph with subscript/superscript ──
          {
            type: "paragraph",
            children: [
              { type: "text", text: "The formula is H" },
              { type: "text", text: "2", format: 32 },
              { type: "text", text: "O and E=mc" },
              { type: "text", text: "2", format: 64 },
              {
                type: "text",
                text: ". These are Board-approved scientific facts.",
              },
            ],
          },

          // ─── Closing paragraph ─────────────────────
          {
            type: "paragraph",
            children: [
              { type: "text", text: "Remember: ", format: 1 },
              {
                type: "text",
                text: "every innie is a volunteer, even if they don't remember volunteering.",
                format: 3,
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

  // ─── New Blocks (Batch 1) ──────────────────────────

  // ─── New Blocks (Batch 1) ──────────────────────────

  // ─── New Blocks (Batch 1) ──────────────────────────

  statsBar: {
    blockType: "statsBar",
    eyebrow: "By the numbers",
    variant: "default",
    stats: [
      {
        id: "sb1",
        value: "847k+",
        label: "Files Refined",
        description: "Across all departments since founding",
      },
      {
        id: "sb2",
        value: "99.7%",
        label: "Severance Uptime",
        description: "Board-certified operational continuity",
      },
      {
        id: "sb3",
        value: "9.8",
        label: "Wellness Score",
        description: "Average innie satisfaction rating",
      },
      {
        id: "sb4",
        value: "16+",
        label: "Departments",
        description: "Active severed floor divisions",
      },
    ],
  },

  partnerGrid: {
    blockType: "partnerGrid",
    eyebrow: "Integration Partners",
    heading: "Built with the best in class",
    description:
      "Our technology partners share Lumon's commitment to precision and operational excellence.",
    partners: [
      {
        id: "pg1",
        logo: mockMedia("Vercel", 200, 80),
        name: "Vercel",
        description:
          "Edge-first deployment with instant rollbacks and global CDN.",
      },
      {
        id: "pg2",
        logo: mockMedia("Stripe", 200, 80),
        name: "Stripe",
        description:
          "Payment processing calibrated to the Board's specifications.",
      },
      {
        id: "pg3",
        logo: mockMedia("Resend", 200, 80),
        name: "Resend",
        description:
          "Transactional email built for developers with real-time analytics.",
      },
      {
        id: "pg4",
        logo: mockMedia("Neon", 200, 80),
        name: "Neon",
        description:
          "Serverless Postgres with branching. Scale to zero, query from the edge.",
      },
      {
        id: "pg5",
        logo: mockMedia("Cloudflare", 200, 80),
        name: "Cloudflare",
        description: "Global network security. Every request optimized.",
      },
      {
        id: "pg6",
        logo: mockMedia("Linear", 200, 80),
        name: "Linear",
        description: "Project management refined to its essence.",
      },
    ],
  },

  jobListings: {
    blockType: "jobListings",
    eyebrow: "Open Positions",
    heading: "Join Lumon Industries",
    description:
      "Your outie has expressed interest in a career with Lumon. The Board is pleased.",
    jobs: [
      {
        id: "jl1",
        title: "Macrodata Refiner",
        department: "MDR",
        location: "Kier, PE",
        type: "full-time",
        salary: "$72k - $95k",
        description: "Sort numbers into bins based on how they make you feel.",
        link: mockCta("Apply Now"),
      },
      {
        id: "jl2",
        title: "Wellness Counselor",
        department: "Wellness",
        location: "Kier, PE",
        type: "full-time",
        salary: "$68k - $88k",
        description:
          "Guide severed employees through Board-approved techniques.",
        link: mockCta("Apply Now"),
      },
      {
        id: "jl3",
        title: "Optics & Design Lead",
        department: "O&D",
        location: "Kier, PE",
        type: "full-time",
        salary: "$85k - $110k",
        description:
          "Lead creative direction for interdepartmental communications.",
        link: mockCta("Apply Now"),
      },
      {
        id: "jl4",
        title: "Break Room Attendant",
        department: "Facilities",
        location: "Kier, PE",
        type: "part-time",
        salary: "$42k - $55k",
        description: "Oversee recalibration sessions. Patience is essential.",
        link: mockCta("Apply Now"),
      },
      {
        id: "jl5",
        title: "Severance Technician",
        department: "Medical",
        location: "Kier, PE",
        type: "contract",
        salary: "$95k - $130k",
        description:
          "Perform the severance procedure. Board certification required.",
        link: mockCta("Apply Now"),
      },
    ],
  },

  // Placeholder fixtures for blocks not yet built (Batch 2)

  tabbedContent: {
    blockType: "tabbedContent",
    eyebrow: "Platform",
    heading: "One platform, every capability",
    description:
      "Each module has been calibrated by the Board for maximum operational efficiency.",
    tabs: [
      {
        id: "tc1",
        label: "Refinement",
        icon: "layers",
        heading: "Macrodata Refinement Engine",
        description:
          "Our proprietary refinement process sorts numbers into bins based on how they make you feel. The work is mysterious and important.",
        image: mockMedia("tab-refinement", 800, 600),
        features: [
          { id: "tf1", text: "Real-time number sorting" },
          { id: "tf2", text: "Four-temper classification" },
          { id: "tf3", text: "Automated bin assignment" },
          { id: "tf4", text: "Wellness-score integration" },
        ],
      },
      {
        id: "tc2",
        label: "Analytics",
        icon: "chart",
        heading: "Board-Level Analytics",
        description:
          "Granular reporting on departmental output, compliance metrics, and interdepartmental synergy.",
        image: mockMedia("tab-analytics", 800, 600),
        features: [
          { id: "tf5", text: "Department dashboards" },
          { id: "tf6", text: "Compliance scoring" },
          { id: "tf7", text: "Quarterly trend analysis" },
        ],
      },
      {
        id: "tc3",
        label: "Wellness",
        icon: "shieldCheck",
        heading: "Employee Wellness System",
        description:
          "Continuous monitoring of innie wellbeing through Board-approved measurement protocols.",
        image: mockMedia("tab-wellness", 800, 600),
        features: [
          { id: "tf8", text: "Mood-based assessments" },
          { id: "tf9", text: "Break Room scheduling" },
          { id: "tf10", text: "Incentive tracking" },
        ],
      },
    ],
  },
  comparisonTable: {
    blockType: "comparisonTable",
    eyebrow: "Compare packages",
    heading: "Find your perfect severance tier",
    description: "Every feature has been approved by the Board.",
    features: [
      { id: "cf1", name: "Macrodata access", category: "Core" },
      { id: "cf2", name: "Refinement capabilities", category: "Core" },
      { id: "cf3", name: "Break allowance", category: "Benefits" },
      { id: "cf4", name: "Waffle party eligibility", category: "Benefits" },
      { id: "cf5", name: "Wellness sessions", category: "Support" },
      { id: "cf6", name: "Dedicated supervisor", category: "Support" },
      { id: "cf7", name: "Perpetuity Wing access", category: "Access" },
      { id: "cf8", name: "Board-level analytics", category: "Access" },
    ],
    plans: [
      {
        id: "cp1",
        name: "Innie",
        price: "Free",
        description: "Begin your journey",
        cta: mockCta("Start Free"),
        values: [
          { featureIndex: 0, value: "partial" },
          { featureIndex: 1, value: "excluded" },
          { featureIndex: 2, value: "text", textValue: "Standard" },
          { featureIndex: 3, value: "excluded" },
          { featureIndex: 4, value: "text", textValue: "Basic" },
          { featureIndex: 5, value: "excluded" },
          { featureIndex: 6, value: "partial" },
          { featureIndex: 7, value: "excluded" },
        ],
      },
      {
        id: "cp2",
        name: "Refined",
        price: "$49/mo",
        description: "Full access to the work",
        recommended: true,
        cta: mockCta("Begin Refinement"),
        values: [
          { featureIndex: 0, value: "included" },
          { featureIndex: 1, value: "included" },
          { featureIndex: 2, value: "text", textValue: "Extended" },
          { featureIndex: 3, value: "included" },
          { featureIndex: 4, value: "text", textValue: "Weekly" },
          { featureIndex: 5, value: "included" },
          { featureIndex: 6, value: "included" },
          { featureIndex: 7, value: "excluded" },
        ],
      },
      {
        id: "cp3",
        name: "Perpetuity",
        price: "$199/mo",
        description: "Everything to Kier's vision",
        cta: mockCta("Contact the Board"),
        values: [
          { featureIndex: 0, value: "included" },
          { featureIndex: 1, value: "included" },
          { featureIndex: 2, value: "text", textValue: "Unlimited" },
          { featureIndex: 3, value: "included" },
          { featureIndex: 4, value: "text", textValue: "Private" },
          { featureIndex: 5, value: "included" },
          { featureIndex: 6, value: "included" },
          { featureIndex: 7, value: "included" },
        ],
      },
    ],
  },
  timeline: {
    blockType: "timeline",
    eyebrow: "Our Journey",
    heading: "The History of Lumon Industries",
    description: "From a single vision to a severed empire.",
    items: [
      {
        id: "tl1",
        date: "1865",
        heading: "Kier Eagan Founds Lumon",
        description:
          "What began as a modest topical salve company in the town of Kier, PE would grow into one of the world's most enigmatic corporations.",
        category: "Origins",
      },
      {
        id: "tl2",
        date: "2003",
        heading: "Severance Technology Conceived",
        description:
          "Lumon researchers achieve a breakthrough in neural partitioning, laying the groundwork for the severance procedure.",
        stat: "847",
        statLabel: "volunteers in first trial",
        category: "Product",
      },
      {
        id: "tl3",
        date: "2018",
        heading: "First Severed Floor Opens",
        description:
          "The inaugural severed floor begins operations with a small team of pioneers. The Macrodata Refinement department is born.",
      },
      {
        id: "tl4",
        date: "2020",
        heading: "Macrodata Refinement Scaled",
        description:
          "The severed floor expands to multiple departments, each handling classified data categories with growing operational capacity.",
        stat: "12K",
        statLabel: "severed employees worldwide",
        category: "Growth",
      },
      {
        id: "tl5",
        date: "2024",
        heading: "Global Expansion",
        description:
          "Lumon opens severed floors in 16 countries. The Board approves the most ambitious growth plan in company history.",
        stat: "$4.2B",
        statLabel: "annual revenue",
      },
      {
        id: "tl6",
        date: "2026",
        heading: "The Future Is Severed",
        description:
          "With near-perfect wellness scores and record refinement output, Lumon proves that the future of work is here.",
        stat: "99.9%",
        statLabel: "wellness score average",
        category: "Milestone",
      },
    ],
  },
};
