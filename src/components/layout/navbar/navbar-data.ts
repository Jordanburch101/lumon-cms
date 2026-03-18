import {
  AnalyticsUpIcon,
  BrainIcon,
  CameraVideoIcon,
  ChartIcon,
  DnaIcon,
  FileIcon,
  HeartCheckIcon,
  LaborIcon,
  MailIcon,
  MicroscopeIcon,
  News01Icon,
  ShieldIcon,
  UserGroupIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface NavLinkItem {
  description?: string;
  href: string;
  icon?: IconSvgElement;
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
    title: "Divisions",
    groups: [
      {
        title: "Core Operations",
        items: [
          {
            title: "Macrodata Refinement",
            href: "/divisions/macrodata-refinement",
            description: "Refining data to its essential form",
            icon: BrainIcon,
          },
          {
            title: "Optics & Design",
            href: "/divisions/optics-design",
            description: "Crafting visual identity with precision",
            icon: CameraVideoIcon,
          },
          {
            title: "Mammalian Nurturance",
            href: "/divisions/mammalian-nurturance",
            description: "Caring for what matters most",
            icon: HeartCheckIcon,
          },
        ],
      },
      {
        title: "Research & Development",
        items: [
          {
            title: "Biotech Solutions",
            href: "/divisions/biotech",
            description: "Advancing the science of wellbeing",
            icon: DnaIcon,
          },
          {
            title: "Topical Applications",
            href: "/divisions/topical-applications",
            description: "Surface-level solutions, deep impact",
            icon: MicroscopeIcon,
          },
          {
            title: "Compliance & Integration",
            href: "/divisions/compliance",
            description: "Ensuring seamless departmental alignment",
            icon: ShieldIcon,
          },
        ],
      },
    ],
  },
  {
    title: "About",
    groups: [
      {
        title: "Company",
        items: [
          {
            title: "Our Mission",
            href: "/about/mission",
            description: "The work is mysterious and important",
            icon: ChartIcon,
          },
          {
            title: "Leadership",
            href: "/about/leadership",
            description: "Guided by the vision of Kier Eagan",
            icon: UserIcon,
          },
          {
            title: "History",
            href: "/about/history",
            description: "A legacy spanning generations",
            icon: AnalyticsUpIcon,
          },
        ],
      },
      {
        title: "Culture",
        items: [
          {
            title: "Employee Wellness",
            href: "/about/wellness",
            description: "Your wellbeing is our priority",
            icon: HeartCheckIcon,
          },
          {
            title: "The Eagan Legacy",
            href: "/about/eagan-legacy",
            description: "Nine core principles for a better world",
            icon: UserGroupIcon,
          },
          {
            title: "Work-Life Balance",
            href: "/about/severance-program",
            description: "A revolutionary approach to harmony",
            icon: LaborIcon,
          },
        ],
      },
    ],
  },
  {
    title: "Resources",
    items: [
      { title: "Newsroom", href: "/newsroom", icon: News01Icon },
      { title: "Handbook", href: "/handbook", icon: FileIcon },
      { title: "Investor Relations", href: "/investors", icon: ChartIcon },
      { title: "Contact", href: "/contact", icon: MailIcon },
    ],
  },
  {
    title: "Careers",
    href: "/careers",
  },
];
