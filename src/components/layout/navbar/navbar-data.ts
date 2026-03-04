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
  NewspaperIcon,
  ShieldIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { IconType } from "@hugeicons/react";

export interface NavLinkItem {
  description?: string;
  href: string;
  icon?: IconType;
  title: string;
}

export interface NavGroup {
  items: NavLinkItem[];
  title: string;
}

export interface NavItem {
  groups?: NavGroup[];
  href?: string;
  items?: NavLinkItem[];
  title: string;
}

export const navItems: NavItem[] = [
  {
    title: "Products",
    groups: [
      {
        title: "Platform",
        items: [
          {
            title: "Analytics",
            href: "/products/analytics",
            description: "Track and measure what matters",
            icon: AnalyticsUpIcon,
          },
          {
            title: "Dashboard",
            href: "/products/dashboard",
            description: "Visualize your data in real time",
            icon: DashboardSquare01Icon,
          },
          {
            title: "Cloud",
            href: "/products/cloud",
            description: "Scalable infrastructure for teams",
            icon: CloudIcon,
          },
        ],
      },
      {
        title: "Tools",
        items: [
          {
            title: "API",
            href: "/products/api",
            description: "Build with our developer platform",
            icon: CodeIcon,
          },
          {
            title: "Integrations",
            href: "/products/integrations",
            description: "Connect your favorite tools",
            icon: LaptopIcon,
          },
          {
            title: "Security",
            href: "/products/security",
            description: "Enterprise-grade protection",
            icon: ShieldIcon,
          },
        ],
      },
    ],
  },
  {
    title: "Solutions",
    groups: [
      {
        title: "By Use Case",
        items: [
          {
            title: "Marketing",
            href: "/solutions/marketing",
            description: "Grow your audience and convert",
            icon: ChartIcon,
          },
          {
            title: "Sales",
            href: "/solutions/sales",
            description: "Close deals faster with insights",
            icon: AnalyticsUpIcon,
          },
          {
            title: "Engineering",
            href: "/solutions/engineering",
            description: "Ship better products, faster",
            icon: CodeIcon,
          },
        ],
      },
      {
        title: "By Team Size",
        items: [
          {
            title: "Startups",
            href: "/solutions/startups",
            description: "Move fast with the right tools",
            icon: UserGroupIcon,
          },
          {
            title: "Enterprise",
            href: "/solutions/enterprise",
            description: "Scale with confidence",
            icon: CloudIcon,
          },
        ],
      },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Blog", href: "/blog", icon: NewspaperIcon },
      { title: "Documentation", href: "/docs", icon: FileIcon },
      { title: "Support", href: "/support", icon: HeadphonesIcon },
      { title: "Contact", href: "/contact", icon: MailIcon },
    ],
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
];
