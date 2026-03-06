export interface Testimonial {
  department: string;
  featured?: boolean;
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
    quote:
      "The severance procedure represents the single greatest advancement in workplace productivity since the assembly line. Our employees arrive each morning unburdened by personal entanglement, fully present, fully devoted. I have never seen a more content workforce\u00A0\u2014\u00A0and I see everything.",
    name: "Harmony Cobel",
    role: "Director",
    department: "Severed Floor",
    featured: true,
  },
  {
    id: "milchick",
    quote:
      "What we've built on the severed floor isn't just efficient\u00A0\u2014\u00A0it's joyful. Our incentive programs drive real engagement. Last quarter alone we awarded three waffle parties, two music-dance experiences, and a coveted egg bar. Morale has never been higher.",
    name: "Seth Milchick",
    role: "Supervisor",
    department: "Macrodata Refinement",
    featured: true,
  },
  {
    id: "kier",
    quote:
      "Let not the mind wander beyond the walls of its purpose. For in the quiet of focused labor, man finds not chains\u00A0\u2014\u00A0but wings. The work is mysterious and important, and it cannot be done anywhere else.",
    name: "Kier Eagan",
    role: "Founder",
    department: "Lumon Industries",
    featured: true,
  },
  {
    id: "mark",
    quote: "I enjoy every moment of my work day. I have no reason not to.",
    name: "Mark S.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "helly",
    quote: "I am grateful for the opportunity to serve Kier's vision.",
    name: "Helly R.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "irving",
    quote: "The handbook says to find meaning in the work itself. I have.",
    name: "Irving B.",
    role: "Refiner",
    department: "MDR",
  },
  {
    id: "dylan",
    quote:
      "The incentives are real and the waffle parties are worth every bin.",
    name: "Dylan G.",
    role: "Refiner",
    department: "MDR",
  },
];

export const featuredTestimonials = testimonials.filter((t) => t.featured);
export const shortTestimonials = testimonials.filter((t) => !t.featured);
