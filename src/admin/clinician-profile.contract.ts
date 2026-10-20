import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

export const CLINICIAN_PHOTO_BUCKET = "clinician-photos";
export const MAX_CLINICIAN_PHOTO_BYTES = 5 * 1024 * 1024;
export const CLINICIAN_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const textList = (maxItems = 40, maxLength = 200) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);
const nullableText = (maxLength: number) => z.string().trim().max(maxLength).nullable();
const photoPathPattern =
  /^clinician-profiles\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|avif)$/;

/** Full admin form payload. `photo_url` is intentionally omitted: legacy same-site portrait URLs are immutable fallbacks; uploaded photos use photo_path. */
export const clinicianProfileInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(1).max(120),
    full_name: z.string().trim().min(1).max(180),
    designation: z.string().trim().min(1).max(160),
    professional_title: z.string().trim().min(1).max(180),
    credentials: z.string().trim().max(240),
    bio: nullableText(5000),
    seo_bio: nullableText(5000),
    specialties: textList(40, 180),
    tags: textList(40, 120),
    years_experience: z.number().int().min(0).max(80).nullable(),
    qualifications: textList(40, 240),
    photo_path: z.string().regex(photoPathPattern).nullable(),
    phone_display: nullableText(40),
    service_mode: z.enum(["clinic", "online_only"]).default("clinic"),
    city: z.string().trim().min(1).max(160).default("Multan"),
    experience: textList(40, 500).default([]),
    training: textList(40, 500).default([]),
    research: textList(40, 500).default([]),
    whatsapp_number: z
      .string()
      .regex(/^[0-9]{8,15}$/)
      .nullable(),
    meta_title: nullableText(200),
    meta_description: nullableText(320),
    intro: textList(20, 3000),
    expertise: textList(40, 180),
    conditions_treated: textList(40, 240),
    approach: textList(20, 3000),
    is_active: z.boolean(),
    is_published: z.boolean(),
    display_order: z.number().int().min(0).max(100000),
  })
  .strict();

export type ClinicianProfileInput = z.infer<typeof clinicianProfileInputSchema>;
export type ClinicianProfileRecord = Tables<"clinician_profiles">;
export type ClinicianPhotoContentType = (typeof CLINICIAN_PHOTO_MIME_TYPES)[number];

export const clinicianPhotoUploadRequestSchema = z
  .object({
    clinicianId: z.string().uuid(),
    contentType: z.enum(CLINICIAN_PHOTO_MIME_TYPES),
    sizeBytes: z.number().int().positive().max(MAX_CLINICIAN_PHOTO_BYTES),
  })
  .strict();

export type PublicClinicianProfile = Omit<
  ClinicianProfileRecord,
  "created_at" | "updated_at" | "is_active" | "is_published" | "photo_url"
> & { photo_url: string | null };

export type AdminClinicianProfile = ClinicianProfileRecord & {
  resolved_photo_url: string | null;
};

export function isClinicianPhotoPathForId(photoPath: string, clinicianId: string): boolean {
  return (
    photoPathPattern.test(photoPath) && photoPath.startsWith(`clinician-profiles/${clinicianId}/`)
  );
}

export function extensionForClinicianPhotoType(contentType: ClinicianPhotoContentType): string {
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
  }
}
