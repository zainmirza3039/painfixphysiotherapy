import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("Dr Zain's public identity separates PT display suffix, clinical role, and DPT qualification", async () => {
  const [llms, profile, schema, team, view, identityMigration, copyMigration] = await Promise.all([
    read("public/llms.txt"),
    read("src/components/site/DoctorProfile.tsx"),
    read("src/lib/doctor-seo.ts"),
    read("src/data/team.ts"),
    read("src/lib/clinician-view.ts"),
    read("supabase/migrations/20261126090000_normalize_zain_clinician_identity.sql"),
    read("supabase/migrations/20261126120000_normalize_zain_profile_copy.sql"),
  ]);

  assert.match(llms, /### Dr\\. Zain Ul Abideen PT/);
  assert.match(llms, /Dr\\. Zain Ul Abideen PT is a Doctor of Physical Therapy \\(DPT\\)/);
  assert.match(llms, /practises as a Clinical Physiotherapist/);

  assert.match(profile, /PainFix Clinical Team/);
  assert.match(profile, /doc\\.fullName/);
  assert.match(profile, /Clinical Physiotherapist/);
  assert.doesNotMatch(profile, /Founder & Lead Physiotherapist/);

  assert.match(team, /fullName: "Dr\\. Zain Ul Abideen PT"/);
  assert.doesNotMatch(team, /fullName: "Dr\\. Zain Ul Abideen, DPT"/);
  assert.match(team, /role: "Founder & Head Physiotherapist"/);
  assert.match(team, /credentials: "DPT \\(Doctor of Physical Therapy\\)"/);

  assert.match(view, /Dr\\. Zain Ul Abideen PT/);
  assert.match(view, /normalizeZainName/);
  assert.match(schema, /Dr\\. Zain Ul Abideen PT \\| PainFix Multan/);
  assert.match(schema, /jobTitle: isZainProfile \\? "Founder & Head Physiotherapist" : doc\\.role/);
  assert.match(schema, /"@type": "EducationalOccupationalCredential"/);
  assert.match(schema, /credentialCategory: "Doctor of Physical Therapy \\(DPT\\)"/);
  assert.match(schema, /name: "Clinical Physiotherapist"/);
  assert.match(schema, /occupationalCategory: "Physiotherapist"/);
  assert.match(schema, /founder:/);

  assert.match(identityMigration, /full_name = 'Dr\\. Zain Ul Abideen, DPT'/);
  assert.match(copyMigration, /seo_bio = replace\\(/);
  assert.match(copyMigration, /intro = ARRAY\\(/);
  assert.match(copyMigration, /Dr\\. Zain Ul Abideen PT/);
  assert.match(copyMigration, /Dr\\. Zain Ul Abideen, DPT/);
});

test("all published clinician routes continue to use the shared profile component", async () => {
  const [zainRoute, jalalRoute, fatimaRoute, sharedProfile] = await Promise.all([
    read("src/routes/dr-zain-ul-abideen-pt-multan.tsx"),
    read("src/routes/dr-jalal-ud-din-pt-multan.tsx"),
    read("src/routes/dr-fatima-iqbal-dpt-multan.tsx"),
    read("src/components/site/PublishedClinicianProfile.tsx"),
  ]);
  for (const route of [zainRoute, jalalRoute, fatimaRoute]) {
    assert.match(route, /PublishedClinicianProfile/);
  }
  assert.match(sharedProfile, /<DoctorProfile doc=\{toClinicianView\(profile\)\} \/>/);
});

test("robots and llms public files remain part of the production public root", async () => {
  const [robots, llms] = await Promise.all([read("public/robots.txt"), read("public/llms.txt")]);
  assert.match(robots, /Sitemap: https:\\/\\/painfixphysiotherapy\\.com\\/sitemap\\.xml/);
  assert.match(robots, /User-agent: OAI-SearchBot[\\s\\S]*?Allow: \\//);
  assert.match(robots, /User-agent: Claude-SearchBot[\\s\\S]*?Allow: \\//);
  assert.match(robots, /User-agent: PerplexityBot[\\s\\S]*?Allow: \\//);
  assert.match(llms, /## Primary business identity/);
  assert.match(llms, /## Clinical team and service locations/);
});
