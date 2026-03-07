import {
  AnalyticsUpIcon,
  ChartIcon,
  CloudIcon,
  CodeIcon,
  DashboardSquare01Icon,
  FileIcon,
  HeadphonesIcon,
  LaptopIcon,
  MailIcon,
  News01Icon,
  ShieldIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface SearchItem {
  href: string;
  icon?: IconSvgElement;
  keywords?: string[];
  subtitle?: string;
  title: string;
}

export interface SearchGroup {
  items: SearchItem[];
  label: string;
}

export const searchGroups: SearchGroup[] = [
  {
    label: "Pages",
    items: [
      {
        title: "Home",
        href: "/",
        keywords: ["landing", "main"],
      },
      {
        title: "Pricing",
        href: "/pricing",
        keywords: ["plans", "cost", "billing"],
      },
      {
        title: "Blog",
        href: "/blog",
        icon: News01Icon,
        keywords: ["articles", "posts", "news"],
      },
      {
        title: "Documentation",
        href: "/docs",
        icon: FileIcon,
        keywords: ["guides", "api", "reference"],
      },
      {
        title: "Support",
        href: "/support",
        icon: HeadphonesIcon,
        keywords: ["help", "contact"],
      },
      {
        title: "Contact",
        href: "/contact",
        icon: MailIcon,
        keywords: ["email", "reach out"],
      },
    ],
  },
  {
    label: "Products",
    items: [
      {
        title: "Analytics",
        subtitle: "Track and measure what matters",
        href: "/products/analytics",
        icon: AnalyticsUpIcon,
      },
      {
        title: "Dashboard",
        subtitle: "Visualize your data in real time",
        href: "/products/dashboard",
        icon: DashboardSquare01Icon,
      },
      {
        title: "Cloud",
        subtitle: "Scalable infrastructure for teams",
        href: "/products/cloud",
        icon: CloudIcon,
      },
      {
        title: "API",
        subtitle: "Build with our developer platform",
        href: "/products/api",
        icon: CodeIcon,
      },
      {
        title: "Integrations",
        subtitle: "Connect your favorite tools",
        href: "/products/integrations",
        icon: LaptopIcon,
      },
      {
        title: "Security",
        subtitle: "Enterprise-grade protection",
        href: "/products/security",
        icon: ShieldIcon,
      },
    ],
  },
  {
    label: "Solutions",
    items: [
      {
        title: "Marketing",
        subtitle: "Grow your audience and convert",
        href: "/solutions/marketing",
        icon: ChartIcon,
      },
      {
        title: "Sales",
        subtitle: "Close deals faster with insights",
        href: "/solutions/sales",
        icon: AnalyticsUpIcon,
      },
      {
        title: "Engineering",
        subtitle: "Ship better products, faster",
        href: "/solutions/engineering",
        icon: CodeIcon,
      },
      {
        title: "Startups",
        subtitle: "Move fast with the right tools",
        href: "/solutions/startups",
        icon: UserGroupIcon,
      },
      {
        title: "Enterprise",
        subtitle: "Scale with confidence",
        href: "/solutions/enterprise",
        icon: CloudIcon,
      },
    ],
  },
  {
    label: "Articles",
    items: [
      {
        title: "Understanding the Severance Protocol",
        subtitle: "Research — 8 min read",
        href: "/blog/severance-protocol",
        icon: News01Icon,
        keywords: ["lumon", "work-life", "science"],
      },
      {
        title: "Inside the Waffle Party",
        subtitle: "Culture — 5 min read",
        href: "/blog/waffle-party",
        icon: News01Icon,
        keywords: ["incentive", "reward", "refiners"],
      },
      {
        title: "The Perpetuity Wing: Walking with Kier",
        subtitle: "Heritage — 6 min read",
        href: "/blog/perpetuity-wing",
        icon: News01Icon,
        keywords: ["founder", "legacy", "tour"],
      },
    ],
  },
];
