import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("clinician profile ownership keeps broad Multan commercial intent on the homepage", async () => {
  const seo = await readFile(new URL("src/lib/doctor-seo.ts", repo), "utf8");
  const team = await readFile(new URL("src/data/team.ts", repo), "utf8");

  assert.match(seo, /homepage owns broad local clinic/);
  assert.match(seo, /Dr\. Jalal Ud Din, DPT \| Clinical Physiotherapist \| PainFix/);
  assert.doesNotMatch(seo, /Dr\. Jalal Ud Din, DPT \| Physiotherapist in Multan/);
  assert.match(team, /Clinical Physiotherapist \| Neuro & Orthopaedic Rehabilitation/);
  assert.match(team, /Dr\. Jalal Ud Din PT \| Clinical Physiotherapist at PainFix/);
  assert.doesNotMatch(team, /Dr\. Jalal Ud Din PT — Physiotherapist in Multan/);
});

test("Dr Jalal live profile migration is guarded against overwriting newer admin edits", async () => {
  const files = await readFile(new URL("../supabase/migrations/20261123120000_separate_jalal_profile_search_intent.sql", import.meta.url), "utf8");
  assert.match(files, /WHERE slug = 'dr-jalal-ud-din-pt-multan'/);
  assert.match(files, /AND is_active = true/);
  assert.match(files, /AND is_published = true/);
  assert.match(files, /AND professional_title = 'Physiotherapist in Multan \| DPT'/);
  assert.match(files, /AND meta_title = 'Dr\. Jalal Ud Din PT — Physiotherapist in Multan \| DPT'/);
  assert.match(files, /AND seo_bio = 'Dr\. Jalal Ud Din PT is a clinical physiotherapist in Multan/);
  assert.match(files, /AND meta_description = 'Dr\. Jalal Ud Din PT is a clinical physiotherapist in Multan/);
  assert.match(files, /AND intro = ARRAY\[/);
  assert.match(files, /Clinical Physiotherapist \| Neuro & Orthopaedic Rehabilitation/);
});
