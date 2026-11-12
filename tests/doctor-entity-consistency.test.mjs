import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("Dr Zain's public identity separates leadership, clinical occupation, and degree", async () => {
  const [llms, profile, schema, team] = await Promise.all([
    read("public/llms.txt"),
    read("src/components/site/DoctorProfile.tsx"),
    read("src/lib/doctor-seo.ts"),
    read("src/data/team.ts"),
  ]);

  assert.match(llms, /Founder & Head Physiotherapist at PainFix Physiotherapy Clinic/);
  assert.match(llms, /Doctor of Physical Therapy \(DPT\)/);
  assert.match(llms, /practises as a Clinical Physiotherapist/);

  assert.match(profile, /Founder & Head Physiotherapist/);
  assert.match(profile, /Clinical Physiotherapist · Clinic-based physiotherapy · Multan/);
  assert.match(profile, /Founder & Lead Physiotherapist/);
  assert.match(profile, /Founder & Head Physiotherapist/);

  assert.match(team, /role: "Founder & Head Physiotherapist"/);
  assert.match(team, /credentials: "DPT \(Doctor of Physical Therapy\)"/);

  assert.match(schema, /jobTitle: isZainProfile \? "Founder & Head Physiotherapist" : doc\.role/);
  assert.match(schema, /"@type": "EducationalOccupationalCredential"/);
  assert.match(schema, /credentialCategory: "Doctor of Physical Therapy \(DPT\)"/);
  assert.match(schema, /name: "Clinical Physiotherapist"/);
  assert.match(schema, /occupationalCategory: "Physiotherapist"/);
  assert.match(schema, /founder:/);
});

test("robots and llms public files remain part of the production public root", async () => {
  const [robots, llms] = await Promise.all([
    read("public/robots.txt"),
    read("public/llms.txt"),
  ]);
  assert.match(robots, /Sitemap: https:\/\/painfixphysiotherapy\.com\/sitemap\.xml/);
  assert.match(robots, /User-agent: OAI-SearchBot[\s\S]*?Allow: \//);
  assert.match(robots, /User-agent: Claude-SearchBot[\s\S]*?Allow: \//);
  assert.match(robots, /User-agent: PerplexityBot[\s\S]*?Allow: \//);
  assert.match(llms, /## Primary business identity/);
  assert.match(llms, /## Clinical team and service locations/);
});
