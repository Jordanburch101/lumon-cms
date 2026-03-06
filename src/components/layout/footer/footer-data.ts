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
    title: "Departments",
    links: [
      { title: "Macrodata Refinement", href: "/departments/mdr" },
      { title: "Optics & Design", href: "/departments/optics-design" },
      { title: "Disposal & Reclamation", href: "/departments/disposal" },
      { title: "Mammalians Nurturable", href: "/departments/mammalians" },
      { title: "Choreography & Movement", href: "/departments/choreography" },
      { title: "Eternal Archives", href: "/departments/archives" },
    ],
  },
  {
    title: "Perks & Benefits",
    links: [
      { title: "Waffle Party", href: "/perks/waffle-party" },
      { title: "Music Dance Experience", href: "/perks/mde" },
      { title: "Finger Traps", href: "/perks/finger-traps" },
      { title: "Melon Bar", href: "/perks/melon-bar" },
      { title: "Coveted Egg Bar", href: "/perks/egg-bar" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "The You You Are", href: "/resources/the-you-you-are" },
      { title: "Compliance Handbook", href: "/resources/handbook" },
      { title: "Wellness Session", href: "/resources/wellness" },
      { title: "Break Room", href: "/resources/break-room" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About Kier", href: "/about/kier-eagan" },
      { title: "The Board", href: "/about/board" },
      { title: "Careers (Severed)", href: "/careers" },
      { title: "Perpetuity Wing", href: "/about/perpetuity-wing" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "X", href: "https://x.com", icon: NewTwitterIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin01Icon },
];

export const legalLinks = [
  { title: "Severance Agreement", href: "/severance-agreement" },
  { title: "Outie Waiver", href: "/outie-waiver" },
];
