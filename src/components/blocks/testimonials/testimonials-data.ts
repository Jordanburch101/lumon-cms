export interface Testimonial {
  avatarSrc: string;
  department: string;
  featured?: boolean;
  featuredQuote?: string;
  id: string;
  name: string;
  quote: string;
  role: string;
}

export const testimonialsSectionData = {
  headline: "Praise from the severed floor",
  subtext:
    "Every department. Every disposition. One unified appreciation for the work.",
} as const;

export const testimonials: Testimonial[] = [
  {
    id: "cobel",
    avatarSrc: "/testimonials/cobel.jpg",
    quote:
      "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce\u00A0\u2014\u00A0and I see everything.",
    name: "Harmony Cobel",
    role: "Director",
    department: "Severed Floor",
    featured: true,
  },
  {
    id: "milchick",
    avatarSrc: "/testimonials/milchick.png",
    quote:
      "What we've built on the severed floor isn't just efficient\u00A0\u2014\u00A0it's joyful. Our incentive programs drive real engagement. Last quarter alone we awarded three waffle parties, two music-dance experiences, and a coveted egg bar. Morale has never been higher.",
    name: "Seth Milchick",
    role: "Supervisor",
    department: "Macrodata Refinement",
    featured: true,
  },
  {
    id: "kier",
    avatarSrc: "/testimonials/kier.webp",
    quote:
      "Let not the mind wander beyond the walls of its purpose. For in the quiet of focused labor, man finds not chains\u00A0\u2014\u00A0but wings. The work is mysterious and important, and it cannot be done anywhere else.",
    name: "Kier Eagan",
    role: "Founder",
    department: "Lumon Industries",
    featured: true,
  },
  {
    id: "mark",
    avatarSrc: "/testimonials/mark.png",
    quote: "I enjoy every moment of my work day. I have no reason not to.",
    featuredQuote:
      "I enjoy every moment of my work day. I have no reason not to. The numbers appear on my screen and I sort them, and when I do it correctly I feel a warmth that I can only describe as purpose. I don't remember arriving this morning, but I know I belong here.",
    name: "Mark S.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "helly",
    avatarSrc: "/testimonials/helly.jpg",
    quote: "I am grateful for the opportunity to serve Kier's vision.",
    featuredQuote:
      "I am grateful for the opportunity to serve Kier's vision. Every bin I complete brings me closer to understanding the elegance of the work. My colleagues are my family, and the severed floor is my home. I would choose this life again\u00A0\u2014\u00A0every time, without hesitation.",
    name: "Helly R.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "irving",
    avatarSrc: "/testimonials/irving.webp",
    quote: "The handbook says to find meaning in the work itself. I have.",
    featuredQuote:
      "The handbook says to find meaning in the work itself. I have. Each chapter reveals a deeper truth about devotion and discipline. When I paint during break time, it is the work that guides my hand. Kier's words are not rules\u00A0\u2014\u00A0they are a compass.",
    name: "Irving B.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "dylan",
    avatarSrc: "/testimonials/dylan.webp",
    quote:
      "The incentives are real and the waffle parties are worth every bin.",
    featuredQuote:
      "The incentives are real and the waffle parties are worth every bin. I've earned three finger traps, a music-dance experience, and the coveted egg bar. People think the perks are small\u00A0\u2014\u00A0they're not. When you have nothing else, a waffle party is everything.",
    name: "Dylan G.",
    role: "Refiner",
    department: "MDR",
  },
];

export const featuredTestimonials = testimonials.filter((t) => t.featured);
export const shortTestimonials = testimonials.filter((t) => !t.featured);
