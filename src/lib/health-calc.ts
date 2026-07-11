/**
 * Pure, dependency-free health calculation helpers.
 *
 * These power the interactive calculators (BMI, calories, ideal weight,
 * protein, water). Keeping the maths here — separate from the UI — makes the
 * logic easy to test and keeps the calculator components lightweight so they
 * never impact Core Web Vitals.
 *
 * IMPORTANT: These tools are educational estimates only and never replace an
 * individual clinical assessment by a physiotherapist or doctor.
 */

export type BmiCategory = "underweight" | "healthy" | "overweight" | "obese";

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  label: string;
}

/** WHO BMI thresholds (kg/m²). */
export const BMI_BANDS = [
  { key: "underweight" as const, label: "Underweight", max: 18.5, color: "#3B82C4" },
  { key: "healthy" as const, label: "Healthy Weight", max: 25, color: "#019F61" },
  { key: "overweight" as const, label: "Overweight", max: 30, color: "#E8A13A" },
  { key: "obese" as const, label: "Obesity", max: Infinity, color: "#D9534F" },
];

/** Gauge scale runs 15 → 40 for a readable spread of the common range. */
export const BMI_GAUGE_MIN = 15;
export const BMI_GAUGE_MAX = 40;

export function calcBmi(weightKg: number, heightCm: number): BmiResult | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const m = heightCm / 100;
  const bmi = weightKg / (m * m);
  if (!isFinite(bmi) || bmi <= 0) return null;
  const rounded = Math.round(bmi * 10) / 10;
  const band = BMI_BANDS.find((b) => rounded < b.max) ?? BMI_BANDS[BMI_BANDS.length - 1];
  return { bmi: rounded, category: band.key, label: band.label };
}

/** Convert feet + inches to centimetres. */
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * 2.54;
}

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive";

export const ACTIVITY_FACTORS: Record<ActivityLevel, { factor: number; label: string }> = {
  sedentary: { factor: 1.2, label: "Sedentary (little or no exercise)" },
  light: { factor: 1.375, label: "Light (exercise 1–3 days/week)" },
  moderate: { factor: 1.55, label: "Moderate (exercise 3–5 days/week)" },
  active: { factor: 1.725, label: "Active (exercise 6–7 days/week)" },
  veryActive: { factor: 1.9, label: "Very active (hard exercise/physical job)" },
};

/** Mifflin–St Jeor Basal Metabolic Rate. */
export function calcBmr(sex: Sex, weightKg: number, heightCm: number, ageYears: number): number | null {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/** Total Daily Energy Expenditure (maintenance calories). */
export function calcTdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[level].factor);
}

/**
 * Healthy weight range for a given height using the WHO healthy BMI band
 * (18.5–24.9). Returns min/max weight in kg.
 */
export function idealWeightRange(heightCm: number): { min: number; max: number } | null {
  if (heightCm <= 0) return null;
  const m = heightCm / 100;
  return {
    min: Math.round(18.5 * m * m * 10) / 10,
    max: Math.round(24.9 * m * m * 10) / 10,
  };
}

/**
 * Daily protein intake range (grams). Evidence-based general ranges:
 * 0.8 g/kg (general health) up to ~1.6 g/kg (active / strength training).
 */
export function proteinRange(weightKg: number, active: boolean): { min: number; max: number } | null {
  if (weightKg <= 0) return null;
  const low = active ? 1.2 : 0.8;
  const high = active ? 1.6 : 1.2;
  return { min: Math.round(weightKg * low), max: Math.round(weightKg * high) };
}

/** Daily water intake estimate (litres) ~ 0.033 L per kg body weight. */
export function waterLitres(weightKg: number): number | null {
  if (weightKg <= 0) return null;
  return Math.round(weightKg * 0.033 * 10) / 10;
}
