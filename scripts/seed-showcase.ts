import { getPayload } from "payload";
import config from "../src/payload.config";

async function seed() {
  const payload = await getPayload({ config });

  // Check if page exists
  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "block-showcase" } },
    limit: 1,
  });

  // Get a media item for logo cloud
  const media = await payload.find({ collection: "media", limit: 5 });
  const mediaIds = media.docs.map((d) => d.id);
  const logoMediaId = mediaIds[0] || 1;

  const layout = [
    // Hero Minimal
    {
      blockType: "hero" as const,
      variant: "minimal",
      headline: "The Board thanks you",
      subtext:
        "Your continued compliance with severance protocol has been recognized. Please enjoy the perplex you have earned.",
      primaryCta: {
        type: "external" as const,
        url: "#",
        label: "Acknowledge",
        appearanceType: "button" as const,
        buttonVariant: "default" as const,
        buttonSize: "lg" as const,
      },
      secondaryCta: {
        type: "external" as const,
        url: "#",
        label: "View Protocol",
        appearanceType: "button" as const,
        buttonVariant: "outline" as const,
        buttonSize: "lg" as const,
      },
    },
    // Features Grid
    {
      blockType: "featuresGrid" as const,
      eyebrow: "Core Capabilities",
      heading: "Refined for operational excellence",
      description:
        "Each module has been designed to the Board's exacting specifications.",
      items: [
        {
          icon: "layers" as const,
          label: "Module 01",
          heading: "Data Refinement",
          description:
            "Sort numbers into bins based on how they make you feel. The purpose is classified.",
        },
        {
          icon: "shieldCheck" as const,
          label: "Module 02",
          heading: "Wellness Monitoring",
          description:
            "Continuous evaluation of employee wellbeing through approved measurement protocols.",
        },
        {
          icon: "lightning" as const,
          label: "Module 03",
          heading: "Perpetuity Wing",
          description:
            "A curated collection of artifacts documenting Kier Eagan's enduring vision for humanity.",
        },
        {
          icon: "lock" as const,
          label: "Module 04",
          heading: "Access Governance",
          description:
            "Compartmentalized permissions ensure each innie accesses only authorized sectors.",
        },
        {
          icon: "chart" as const,
          label: "Module 05",
          heading: "Quarterly Analytics",
          description:
            "Granular reporting on departmental output, compliance, and interdepartmental synergy.",
        },
        {
          icon: "sync" as const,
          label: "Module 06",
          heading: "Protocol Sync",
          description:
            "Real-time harmonization of departmental procedures with Board-approved directives.",
        },
      ],
    },
    // Hero Split with stats
    {
      blockType: "hero" as const,
      variant: "split",
      mediaSrc: logoMediaId,
      headline: "Macrodata Refinement",
      subtext:
        "Your outie has been informed of these results. All metrics reflect quarterly performance data as verified by the Board.",
      stats: [
        { value: "97.3", label: "Wellness Score" },
        { value: "4.2k", label: "Files Refined" },
        { value: "12", label: "Departments" },
        { value: "99.8%", label: "Uptime" },
      ],
      primaryCta: {
        type: "external" as const,
        url: "#",
        label: "Access Dashboard",
        appearanceType: "button" as const,
        buttonVariant: "default" as const,
        buttonSize: "lg" as const,
      },
      secondaryCta: {
        type: "external" as const,
        url: "#",
        label: "Department Brief",
        appearanceType: "button" as const,
        buttonVariant: "outline" as const,
        buttonSize: "lg" as const,
      },
    },
    // Team
    {
      blockType: "team" as const,
      eyebrow: "Department Personnel",
      heading: "Macrodata Refinement",
      description:
        "Your outie selected you for this role. The Board is grateful.",
      variant: "detailed" as const,
      members: [
        { name: "Mark Scout", role: "Department Chief", department: "MDR" },
        { name: "Helly Riggs", role: "Refiner", department: "MDR" },
        { name: "Irving Bailiff", role: "Refiner", department: "MDR" },
        { name: "Dylan George", role: "Refiner", department: "MDR" },
      ],
    },
    // CTA Band Primary
    {
      blockType: "ctaBand" as const,
      variant: "primary" as const,
      heading: "Your department requires your attention",
      subtext:
        "The Board has scheduled a mandatory wellness session. Please report to your assigned floor.",
      primaryCta: {
        type: "external" as const,
        url: "#",
        label: "Begin Session",
        appearanceType: "button" as const,
        buttonVariant: "default" as const,
        buttonSize: "lg" as const,
      },
      secondaryCta: {
        type: "external" as const,
        url: "#",
        label: "Report Issue",
        appearanceType: "button" as const,
        buttonVariant: "outline" as const,
        buttonSize: "lg" as const,
      },
    },
    // CTA Band Card
    {
      blockType: "ctaBand" as const,
      variant: "card" as const,
      eyebrow: "Interdepartmental Notice",
      heading: "Ready to refine your workflow?",
      subtext:
        "Deploy a severed floor in minutes. No outie involvement required.",
      primaryCta: {
        type: "external" as const,
        url: "#",
        label: "Get Started",
        appearanceType: "button" as const,
        buttonVariant: "default" as const,
        buttonSize: "default" as const,
      },
      secondaryCta: {
        type: "external" as const,
        url: "#",
        label: "Read Documentation",
        appearanceType: "button" as const,
        buttonVariant: "outline" as const,
        buttonSize: "default" as const,
      },
    },
    // Timeline
    {
      blockType: "timeline" as const,
      eyebrow: "Our Journey",
      heading: "The History of Lumon Industries",
      description:
        "From a modest topical salve company to the pioneer of severance technology — trace the milestones that shaped the world's most enigmatic corporation.",
      items: [
        {
          date: "1865",
          heading: "Kier Eagan Founds Lumon",
          description:
            "What began as a modest topical salve company in the town of Kier, PE would grow into one of the world's most enigmatic corporations. Kier's founding treatise outlined a vision far beyond commerce.",
          category: "Origins",
        },
        {
          date: "1941",
          heading: "The Eagan Dynasty Continues",
          description:
            "Successive generations of Eagans maintain the founding vision, expanding Lumon's reach across industries and continents while preserving the core tenets of Kier's philosophy.",
          stat: "4",
          statLabel: "generations of leadership",
          category: "Leadership",
        },
        {
          date: "2003",
          heading: "Severance Technology Conceived",
          description:
            "Lumon researchers achieve a breakthrough in neural partitioning, laying the groundwork for the severance procedure. The first theoretical models demonstrate complete memory bifurcation is possible.",
          stat: "847",
          statLabel: "volunteers in first trial",
          category: "Product",
        },
        {
          date: "2018",
          heading: "First Severed Floor Opens",
          description:
            "The inaugural severed floor begins operations with a small team of pioneers. The Macrodata Refinement department is born, setting the template for all departments to follow.",
        },
        {
          date: "2024",
          heading: "Global Expansion",
          description:
            "Lumon opens severed floors in 16 countries. The Board approves the most ambitious growth plan in company history, with operations spanning every major economic region.",
          stat: "$4.2B",
          statLabel: "annual revenue",
          category: "Growth",
        },
        {
          date: "2026",
          heading: "The Future Is Severed",
          description:
            "With near-perfect wellness scores and record refinement output, Lumon proves that the future of work is mysterious, important, and here. Every department reports unprecedented harmony.",
          stat: "99.9%",
          statLabel: "wellness score average",
          category: "Milestone",
        },
      ],
    },
    // Logo Cloud Grid
    {
      blockType: "logoCloud" as const,
      eyebrow: "Trusted by departments worldwide",
      variant: "grid" as const,
      logos: [
        { logo: logoMediaId, name: "Lumon Industries" },
        { logo: logoMediaId, name: "Eagan Corp" },
        { logo: logoMediaId, name: "Myrtle Systems" },
        { logo: logoMediaId, name: "Optics & Design" },
      ],
    },
  ];

  if (existing.docs.length > 0) {
    await payload.update({
      collection: "pages",
      id: existing.docs[0].id,
      data: { title: "Block Showcase", layout, _status: "published" },
    });
    console.log("Updated page:", existing.docs[0].id);
  } else {
    const page = await payload.create({
      collection: "pages",
      data: {
        title: "Block Showcase",
        slug: "block-showcase",
        layout,
        _status: "published",
      },
    });
    console.log("Created page:", page.id);
  }

  console.log("Done! Visit http://localhost:3000/block-showcase");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
