import {
  GithubIcon,
  Linkedin01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export interface FooterLinkColumn {
  links: { href: string; title: string }[];
  title: string;
}

export interface SocialLink {
  href: string;
  icon: IconSvgElement;
  label: string;
}

export const footerColumns: FooterLinkColumn[] = [
  {
    title: "Product",
    links: [
      { title: "Analytics", href: "/products/analytics" },
      { title: "Dashboard", href: "/products/dashboard" },
      { title: "Cloud", href: "/products/cloud" },
      { title: "API", href: "/products/api" },
      { title: "Integrations", href: "/products/integrations" },
      { title: "Security", href: "/products/security" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { title: "Marketing", href: "/solutions/marketing" },
      { title: "Sales", href: "/solutions/sales" },
      { title: "Engineering", href: "/solutions/engineering" },
      { title: "Startups", href: "/solutions/startups" },
      { title: "Enterprise", href: "/solutions/enterprise" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Documentation", href: "/docs" },
      { title: "Support", href: "/support" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Careers", href: "/careers" },
      { title: "Press", href: "/press" },
      { title: "Legal", href: "/legal" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "X", href: "https://x.com", icon: NewTwitterIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin01Icon },
];

export const legalLinks = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
];
