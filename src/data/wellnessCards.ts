import { Dumbbell, Salad, type LucideIcon } from "lucide-react";
import fitnessImg from "@/assets/services/fitness-rehabilitation.webp";
import dietImg from "@/assets/services/diet-nutrition.webp";

/**
 * Extra "What We Provide" cards for wellness offerings that live on their own
 * routes rather than in the core `services` data. Rendered alongside the
 * physiotherapy service cards on the homepage and the Services index.
 *
 * Diet Plans links to the (currently gated) /diet-nutrition page and carries a
 * "Launching Soon" badge until a qualified dietitian officially joins PainFix.
 */
export interface WellnessCard {
  to: "/fitness-rehabilitation" | "/diet-nutrition";
  title: string;
  tagline: string;
  icon: LucideIcon;
  image: string;
  alt: string;
  badge?: string;
}

export const wellnessCards: WellnessCard[] = [
  {
    to: "/fitness-rehabilitation",
    title: "Personalised Fitness & Rehabilitation",
    tagline:
      "Physiotherapist-led exercise, strength and injury-prevention programmes built around your body and goals.",
    icon: Dumbbell,
    image: fitnessImg,
    alt: "Physiotherapist guiding a patient through a strength and rehabilitation exercise at PainFix Physiotherapy Clinic in Multan",
  },
  {
    to: "/diet-nutrition",
    title: "Diet Plans",
    tagline:
      "Personalised nutrition guidance and diet plans prepared by qualified dietitians to support rehabilitation, recovery, weight management, and overall health.",
    icon: Salad,
    image: dietImg,
    alt: "Healthy balanced meal with fresh vegetables, lean protein and nuts representing PainFix diet and nutrition plans in Multan",
    badge: "Launching Soon",
  },
];
