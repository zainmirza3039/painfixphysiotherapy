export interface MembershipPlan {
  slug: string;
  name: string;
  tagline: string;
  /** Display price, e.g. "PKR 6,000". Kept as text for easy editing. */
  price: string;
  period: string;
  featured?: boolean;
  features: string[];
}

/**
 * Membership & package plans.
 *
 * NOTE: This is the single source of truth for plans shown on /membership.
 * Prices are illustrative starting points and are confirmed on WhatsApp after
 * an assessment. This data layer is structured so a future Admin Panel CMS can
 * manage plans without touching UI code.
 */
export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "Kick-start your fitness with expert guidance.",
    price: "From PKR 6,000",
    period: "/ month",
    features: [
      "Initial fitness assessment",
      "Personalised home exercise programme",
      "1 physiotherapist review session / month",
      "WhatsApp support for questions",
      "Access to educational resources",
    ],
  },
  {
    slug: "active",
    name: "Active",
    tagline: "Physiotherapy + fitness for steady, guided progress.",
    price: "From PKR 12,000",
    period: "/ month",
    featured: true,
    features: [
      "Everything in Starter",
      "2 supervised sessions / month",
      "Progressive programme with monthly reassessment",
      "Mobility & injury-prevention coaching",
      "Priority WhatsApp support",
    ],
  },
  {
    slug: "performance",
    name: "Performance",
    tagline: "Intensive rehab-to-performance for the committed.",
    price: "From PKR 20,000",
    period: "/ month",
    features: [
      "Everything in Active",
      "4 supervised sessions / month",
      "Sport-specific strength & conditioning",
      "Return-to-sport programming",
      "Detailed progress tracking & reassessment",
    ],
  },
];
