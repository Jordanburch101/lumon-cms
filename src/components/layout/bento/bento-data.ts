export const bentoSectionData = {
  headline: "Everything you need, ready to ship",
  subtext:
    "A complete design system with production-grade components. Charts, forms, theming, and more — all wired up and ready to go.",
} as const;

export const chartData = [
  { month: "Jan", visitors: 2100 },
  { month: "Feb", visitors: 2400 },
  { month: "Mar", visitors: 1800 },
  { month: "Apr", visitors: 3200 },
  { month: "May", visitors: 2900 },
  { month: "Jun", visitors: 3800 },
] as const;

export const statsData = [
  { label: "Revenue", value: "$48.2k", change: "+12.5%" },
  { label: "Users", value: "2,847", change: "+8.1%" },
  { label: "Uptime", value: "99.98%", change: "+0.02%" },
] as const;

export const imageCardData = {
  src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
  alt: "Abstract colorful gradient mesh",
  title: "Rich Media",
  description:
    "Optimized images, video, and media handling with Next.js Image and responsive layouts.",
  badge: "Built-in",
} as const;
