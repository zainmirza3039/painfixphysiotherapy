import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("Dr Zain's public identity separates leadership, clinical occupation, and degree", async () => {
  const [llms, profile, schema, team, identityMigration, copyMigration] = await Promise.all([
    read("public/llms.txt"),
    read("src/components/site/DoctorProfile.tsx"),
    read("src/lib/doctor-seo.ts"),
    read("src/data/team.ts"),
    read("supabase/migrations/20261126090000_normalize_zain_clinician_identity.sql"),
    read("supabase/migrations/20261126120000_normalize_zain_profile_copy.sql"),
  ]);

  assert.match(llms, /Founder & Head Physiotherapist at PainFix Physiotherapy Clinic/);
  assert.match(llms, /Doctor of Physical Therapy \(DPT\)/);
  assert.match(llms, /practises as a Clinical Physiotherapist/);

  assert.match(profile, /Founder & Head Physiotherapist/);
  assert.match(profile, /Clinical Physiotherapist · Clinic-based physiotherapy · Multan/);
  assert.doesNotMatch(profile, /Founder & Lead Physiotherapist/);
  assert.match(team, /fullName: "Dr. Zain Ul Abideen, DPT"/);
  assert.doesNotMatch(team, /Dr\. Zain Ul Abideen PT/);

  assert.match(team, /role: "Founder & Head Physiotherapist"/);
  assert.match(team, /role: "Co-Founder"/);
  assert.match(llms, /Co-Founder of PainFix Physiotherapy Clinic, Multan, and a clinical physiotherapist/);
  assert.match(team, /credentials: "DPT \(Doctor of Physical Therapy\)"/);

  assert.match(schema, /jobTitle: isZainProfile \? "Founder & Head Physiotherapist" : doc\.role/);
  assert.match(schema, /"@type": "EducationalOccupationalCredential"/);
  assert.match(schema, /credentialCategory: "Doctor of Physical Therapy \(DPT\)"/);
  assert.match(schema, /name: "Clinical Physiotherapist"/);
  assert.match(schema, /occupationalCategory: "Physiotherapist"/);
  assert.match(schema, /founder:/);

  assert.match(identityMigration, /full_name = 'Dr\. Zain Ul Abideen, DPT'/);
  assert.match(copyMigration, /seo_bio = replace\(/);
  assert.match(copyMigration, /intro = ARRAY\(/);
  assert.match(copyMigration, /Dr\. Zain Ul Abideen PT/);
  assert.match(copyMigration, /Dr\. Zain Ul Abideen, DPT/);
});

test("robots and llms public files remain part of the production public root", async () => {
  const [robots, llms] = await Promise.all([read("public/robots.txt"), read("public/llms.txt")]);
  assert.match(robots, /Sitemap: https:\/\/painfixphysiotherapy\.com\/sitemap\.xml/);
  assert.match(robots, /User-agent: OAI-SearchBot[\s\S]*?Allow: \//);
  assert.match(robots, /User-agent: Claude-SearchBot[\s\S]*?Allow: \//);
  assert.match(robots, /User-agent: PerplexityBot[\s\S]*?Allow: \//);
  assert.match(llms, /## Primary business identity/);
  assert.match(llms, /## Clinical team and service locations/);
});
