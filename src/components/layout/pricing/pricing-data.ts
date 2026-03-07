export interface PricingTier {
  annualPrice: number;
  badge?: string;
  cta: { label: string; href: string };
  description: string;
  features: string[];
  monthlyPrice: number;
  name: string;
  recommended?: boolean;
}

export const pricingSectionData = {
  headline: "Choose your Severance Package",
  subtext:
    "Each tier has been carefully calibrated by the Board to maximize your contribution to the work.",
  footnote: "The work is mysterious and important.",
  footnoteAttribution: "Kier Eagan",
} as const;

export const pricingTiers: PricingTier[] = [
  {
    name: "Innie",
    description: "Begin your journey on the severed floor.",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Macrodata access (read-only)",
      "Standard break allowance",
      "Handbook chapters 1\u20133",
      "Shared perpetuity wing access",
      "Basic wellness check",
    ],
    cta: { label: "Begin Orientation", href: "/orientation" },
  },
  {
    name: "Refined",
    description: "Full access to the work and its rewards.",
    monthlyPrice: 49,
    annualPrice: 39,
    badge: "Board Approved",
    recommended: true,
    features: [
      "Everything in Innie",
      "Full refinement capabilities",
      "Priority waffle party queue",
      "Music-dance experience (monthly)",
      "Dedicated supervisor",
      "Egg bar access",
    ],
    cta: { label: "Begin Refinement", href: "/refinement" },
  },
  {
    name: "Perpetuity",
    description: "For those who give everything to Kier\u2019s vision.",
    monthlyPrice: 199,
    annualPrice: 159,
    features: [
      "Everything in Refined",
      "Unlimited department transfers",
      "Private wellness sessions",
      "Board-level analytics",
      "Revolving (unlimited) incentives",
      "Custom orientation protocol",
    ],
    cta: { label: "Contact the Board", href: "/contact" },
  },
];
