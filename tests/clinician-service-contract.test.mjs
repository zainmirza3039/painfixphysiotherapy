import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { clinicianProfileInputSchema } from "../src/admin/clinician-profile.contract.ts";

const migrationPath = new URL(
  "../supabase/migrations/20261021000000_add_clinician_service_and_cv_fields.sql",
  import.meta.url,
);
const seedPath = new URL("../supabase/seeds/ariba-babar.sql", import.meta.url);

const base = {
  slug: "ariba-babar",
  name: "ARIBA BABAR, DPT",
  full_name: "ARIBA BABAR, DPT",
  designation: "Doctor of Physical Therapy",
  professional_title: "Doctor of Physical Therapy",
  credentials: "DPT",
  bio: null,
  seo_bio: null,
  specialties: [],
  tags: [],
  years_experience: null,
  qualifications: ["Doctor of Physical Therapy (DPT)"],
  photo_path: null,
  phone_display: "+92 312 0102560",
  whatsapp_number: "923120102560",
  meta_title: null,
  meta_description: null,
  intro: [],
  expertise: [],
  conditions_treated: [],
  approach: [],
  is_active: true,
  is_published: true,
  display_order: 40,
  service_mode: "online_only",
  city: "Rahim Yar Khan, Pakistan",
  experience: ["Supervised clinical internship"],
  training: ["Dry needling training"],
  research: ["Observational study"],
};

test("clinician contract exposes and validates service/CV fields", () => {
  const parsed = clinicianProfileInputSchema.parse(base);
  assert.equal(parsed.service_mode, "online_only");
  assert.equal(parsed.city, "Rahim Yar Khan, Pakistan");
  assert.deepEqual(parsed.experience, base.experience);
  assert.deepEqual(parsed.training, base.training);
  assert.deepEqual(parsed.research, base.research);
});

test("service mode, city, and CV safety boundaries are enforced", () => {
  for (const patch of [
    { service_mode: "hybrid" },
    { city: "   " },
    { city: "x".repeat(161) },
    { experience: ["   "] },
    { training: ["x".repeat(501)] },
    { research: "not-an-array" },
  ])
    assert.equal(clinicianProfileInputSchema.safeParse({ ...base, ...patch }).success, false);
  const legacy = clinicianProfileInputSchema.parse({
    ...base,
    service_mode: undefined,
    city: undefined,
    experience: undefined,
    training: undefined,
    research: undefined,
  });
  assert.equal(legacy.service_mode, "clinic");
  assert.equal(legacy.city, "Multan");
  assert.deepEqual(legacy.experience, []);
});

test("migration is additive, exact-defaulted, and does not replay old setup or alter unrelated data", async () => {
  const sql = await readFile(migrationPath, "utf8");
  assert.match(sql, /ALTER TABLE public\.clinician_profiles/);
  for (const column of ["service_mode", "city", "experience", "training", "research"])
    assert.match(sql, new RegExp(`ADD COLUMN IF NOT EXISTS ${column}`));
  assert.match(sql, /service_mode text NOT NULL DEFAULT 'clinic'/i);
  assert.match(sql, /city text NOT NULL DEFAULT 'Multan'/i);
  for (const field of ["experience", "training", "research"])
    assert.match(sql, new RegExp(`${field} text\\[\\] NOT NULL DEFAULT '\\{\\}'::text\\[\\]`));
  assert.match(sql, /service_mode IN \('clinic', 'online_only'\)/i);
  assert.match(sql, /char_length\(btrim\(city\)\) BETWEEN 1 AND 160/i);
  assert.doesNotMatch(sql, /CREATE TABLE public\.clinician_profiles/i);
  assert.doesNotMatch(sql, /CREATE TABLE public\.clinician_photo_assets/i);
  assert.doesNotMatch(sql, /(?:DROP|TRUNCATE)\s+TABLE/i);
  assert.doesNotMatch(
    sql,
    /(?:public\.(?:profiles|patients|appointments|home_visit_requests|user_roles)|auth\.users|medical-reports)/i,
  );
});

test("Ariba seed is reviewable, idempotent, and contains no email or unsupported certification claim", async () => {
  const sql = await readFile(seedPath, "utf8");
  assert.match(sql, /slug, name, full_name/);
  assert.match(sql, /'ariba-babar'/);
  assert.match(sql, /'online_only'/);
  assert.match(sql, /'Rahim Yar Khan, Pakistan'/);
  assert.match(sql, /'923120102560'/);
  assert.match(sql, /ON CONFLICT \(slug\) DO NOTHING/i);
  assert.match(sql, /photo_path, photo_url/);
  assert.doesNotMatch(sql, /email/i);
  assert.doesNotMatch(sql, /certified|certification/i);
  assert.doesNotMatch(sql, /CREATE TABLE|ALTER TABLE|DROP TABLE/i);
});
