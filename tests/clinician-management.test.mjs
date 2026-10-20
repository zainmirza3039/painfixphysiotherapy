import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clinicianPhotoUploadRequestSchema,
  clinicianProfileInputSchema,
  isClinicianPhotoPathForId,
  MAX_CLINICIAN_PHOTO_BYTES,
} from "../src/admin/clinician-profile.contract.ts";

const clinicianId = "b13b160c-52d8-4dc1-846c-6cdbdc07d449";
const validProfile = {
  slug: "dr-sample-pt",
  name: "Dr. Sample",
  full_name: "Dr. Sample PT",
  designation: "Clinical Physiotherapist",
  professional_title: "Physiotherapist in Multan | DPT",
  credentials: "DPT",
  bio: "Evidence-based care.",
  seo_bio: "Physiotherapy in Multan.",
  specialties: ["Manual Therapy"],
  tags: ["Back Pain"],
  years_experience: 8,
  qualifications: ["Doctor of Physical Therapy"],
  photo_path: null,
  phone_display: "0314-3039582",
  whatsapp_number: "923143039582",
  service_mode: "clinic",
  city: "Multan",
  experience: [],
  training: [],
  research: [],
  meta_title: "Dr. Sample | PainFix",
  meta_description: "Meet Dr. Sample at PainFix.",
  intro: ["A clinician introduction."],
  expertise: ["Rehabilitation"],
  conditions_treated: ["Back pain"],
  approach: ["Assess, plan, and review."],
  is_active: true,
  is_published: false,
  display_order: 10,
};

test("accepts a complete valid admin clinician payload", () => {
  assert.equal(clinicianProfileInputSchema.safeParse(validProfile).success, true);
});

test("rejects invalid slugs, empty names, negative experience, and non-digit WhatsApp values", () => {
  for (const patch of [
    { slug: "Dr Sample" },
    { full_name: "   " },
    { years_experience: -1 },
    { whatsapp_number: "+92 314 3039582" },
  ]) {
    assert.equal(
      clinicianProfileInputSchema.safeParse({ ...validProfile, ...patch }).success,
      false,
      `expected invalid payload for ${JSON.stringify(patch)}`,
    );
  }
});

test("requires strict payloads and does not accept a client-supplied photo URL", () => {
  assert.equal(
    clinicianProfileInputSchema.safeParse({
      ...validProfile,
      photo_url: "https://untrusted.example/photo.jpg",
    }).success,
    false,
  );
  assert.equal(
    clinicianProfileInputSchema.safeParse({ ...validProfile, role: "admin" }).success,
    false,
  );
});

test("photo object paths must be scoped to the target clinician ID", () => {
  const path = `clinician-profiles/${clinicianId}/b013160c-52d8-4dc1-846c-6cdbdc07d449.webp`;
  assert.equal(isClinicianPhotoPathForId(path, clinicianId), true);
  assert.equal(isClinicianPhotoPathForId(path, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"), false);
  assert.equal(isClinicianPhotoPathForId("../medical-reports/private.pdf", clinicianId), false);
});

test("upload requests enforce image MIME allowlist and the 5 MiB bound", () => {
  const valid = {
    clinicianId,
    contentType: "image/webp",
    sizeBytes: MAX_CLINICIAN_PHOTO_BYTES,
  };
  assert.equal(clinicianPhotoUploadRequestSchema.safeParse(valid).success, true);
  assert.equal(
    clinicianPhotoUploadRequestSchema.safeParse({ ...valid, contentType: "application/pdf" })
      .success,
    false,
  );
  assert.equal(
    clinicianPhotoUploadRequestSchema.safeParse({
      ...valid,
      sizeBytes: MAX_CLINICIAN_PHOTO_BYTES + 1,
    }).success,
    false,
  );
});

test("migration does not grant direct table writes or touch staff/patient tables", async () => {
  const migration = await readFile(
    new URL(
      "../supabase/migrations/20261017090000_add_clinician_profile_management.sql",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    migration,
    /REVOKE ALL ON TABLE public\.clinician_profiles FROM PUBLIC, anon, authenticated/i,
  );
  assert.match(
    migration,
    /GRANT SELECT ON TABLE public\.clinician_profiles TO anon, authenticated/i,
  );
  assert.match(migration, /GRANT ALL ON TABLE public\.clinician_profiles TO service_role/i);
  assert.match(
    migration,
    /CREATE POLICY clinician_profiles_public_read[\s\S]*?FOR SELECT TO anon[\s\S]*?is_active AND is_published/i,
  );
  assert.match(
    migration,
    /CREATE POLICY clinician_profiles_authenticated_read[\s\S]*?public\.is_admin/i,
  );
  assert.match(migration, /CREATE TABLE public\.clinician_photo_assets[\s\S]*?path_owner_check/i);
  assert.match(
    migration,
    /FOREIGN KEY \(photo_path, id\)[\s\S]*?REFERENCES public\.clinician_photo_assets \(path, clinician_profile_id\)[\s\S]*?ON DELETE RESTRICT/i,
  );
  assert.match(
    migration,
    /REVOKE ALL ON TABLE public\.clinician_photo_assets FROM PUBLIC, anon, authenticated/i,
  );
  assert.doesNotMatch(
    migration,
    /(?:ALTER|DROP|TRUNCATE)\s+TABLE\s+public\.(?:profiles|patients|appointments|home_visit_requests|user_roles)/i,
  );
  assert.doesNotMatch(
    migration,
    /CREATE POLICY[\s\S]*?FOR\s+(?:INSERT|UPDATE|DELETE|ALL)\s+TO\s+(?:anon|authenticated)/i,
  );
});
