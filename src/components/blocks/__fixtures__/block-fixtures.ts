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
  // Text fields, arrays, and nested objects get auto-detected controls
  // from the fixture values — no need to list them here
};

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
        mediaSrc: mockMedia("split-office", 800, 600),
        mediaAlt: "Office corridor",
        mediaLabel: "Severed Floor",
        mediaOverlay: {
          title: "Lumon Industries HQ",
          description: "Sub-level severed floor, east wing corridor B.",
          badge: "Restricted",
        },
      },
      {
        id: "r2",
        headline: "Built for precision",
        body: "Each department operates independently, connected only through Board-approved channels.",
        mediaSrc: mockMedia("split-workspace", 800, 600),
        mediaAlt: "Workspace interior",
        mediaLabel: "MDR Department",
        mediaOverlay: {
          title: "Macrodata Refinement",
          description: "Primary workstation cluster, capacity: 4 refiners.",
        },
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
          avatar: mockPortrait("Harmony Cobel", "women", 65),
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
        photo: mockPortrait("Mark Scout", "men", 32),
      },
      {
        id: "m2",
        name: "Helly Riggs",
        role: "Refiner",
        department: "MDR",
        photo: mockPortrait("Helly Riggs", "women", 44),
      },
      {
        id: "m3",
        name: "Irving Bailiff",
        role: "Refiner",
        department: "MDR",
        photo: mockPortrait("Irving Bailiff", "men", 67),
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
};
