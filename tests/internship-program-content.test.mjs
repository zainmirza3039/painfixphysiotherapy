import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const seedPath = new URL(
  "supabase/migrations/20261021022001_seed_clinical_physiotherapy_internship.sql",
  root,
);
const internshipMigrationPath = new URL(
  "supabase/migrations/20261021022000_internship_certificates.sql",
  root,
);
const clinicianMigrationPath = new URL(
  "supabase/migrations/20261021000000_add_clinician_service_and_cv_fields.sql",
  root,
);

test("confirmed clinical internship seed contains the approved public programme details", async () => {
  const seed = await readFile(seedPath, "utf8");
  for (const expected of [
    "clinical-physiotherapy-internship",
    "40 working days (80 scheduled hours)",
    "Monday–Saturday, 2:00 PM–4:00 PM",
    "PKR 6,000",
    "Final-year DPT students and DPT graduates",
    "90",
    "independently",
  ]) {
    assert.equal(seed.includes(expected), true, expected);
  }
  assert.match(seed, /status,\s*\n\s*required_documents[\s\S]*'published'/);
  assert.match(seed, /applications_open,\s*\n\s*status[\s\S]*true/);
});

test("internship schema and seed migrations follow the existing clinician migration", async () => {
  const [clinician, internship, seed] = await Promise.all([
    readFile(clinicianMigrationPath, "utf8"),
    readFile(internshipMigrationPath, "utf8"),
    readFile(seedPath, "utf8"),
  ]);
  assert.ok(clinician.length > 0);
  assert.ok(internship.length > 0);
  assert.match(seed, /ON CONFLICT \(slug\) DO NOTHING/);
  assert.equal(
    "20261021022000_internship_certificates.sql" <
      "20261021022001_seed_clinical_physiotherapy_internship.sql",
    true,
  );
});
