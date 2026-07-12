// Shared, client-safe definitions for the Fitness Content CMS.
// The database table `fitness_content` stores every fitness-related item a
// Fitness Professional manages. This flexible model is intentionally generic
// so future professional roles (e.g. dietitian) can reuse the same pattern.

export const FITNESS_CONTENT_TYPES = [
  "service",
  "programme",
  "workout_plan",
  "online_coaching",
  "mobility",
  "stretching",
  "injury_prevention",
  "warmup_cooldown",
  "assessment",
  "resource",
  "membership",
  "faq",
] as const;

export type FitnessContentType = (typeof FITNESS_CONTENT_TYPES)[number];

export const FITNESS_TYPE_LABELS: Record<FitnessContentType, string> = {
  service: "Fitness Service",
  programme: "Fitness Programme",
  workout_plan: "Home Workout Plan",
  online_coaching: "Online Coaching",
  mobility: "Mobility Programme",
  stretching: "Stretching Programme",
  injury_prevention: "Injury Prevention Programme",
  warmup_cooldown: "Warm-up & Cool-down Guide",
  assessment: "Fitness Assessment",
  resource: "Fitness Resource",
  membership: "Membership Package",
  faq: "FAQ",
};

export function fitnessTypeLabel(type: string): string {
  return FITNESS_TYPE_LABELS[type as FitnessContentType] ?? type;
}

export const CALCULATOR_KEYS = ["bmi", "calorie", "water", "protein", "ideal_weight"] as const;

export type CalculatorKey = (typeof CALCULATOR_KEYS)[number];

export const CALCULATOR_LABELS: Record<CalculatorKey, string> = {
  bmi: "BMI Calculator",
  calorie: "Calorie Calculator",
  water: "Water Intake Calculator",
  protein: "Protein Intake Calculator",
  ideal_weight: "Ideal Weight Calculator",
};
