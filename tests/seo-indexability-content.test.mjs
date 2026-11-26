import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("exercise and electrotherapy service pages expose distinct clinical guidance", async () => {
  const source = await readFile(new URL("src/data/services.ts", repo), "utf8");
  const exercise = source.slice(source.indexOf('slug: "exercise-therapy"'), source.indexOf('slug: "electrotherapy"'));
  const electro = source.slice(source.indexOf('slug: "electrotherapy"'), source.indexOf('slug: "sports-rehabilitation"'));
  assert.match(exercise, /progressive resistance exercise/);
  assert.match(exercise, /functional measures/);
  assert.match(exercise, /rapidly worsening limb weakness/);
  assert.match(electro, /TENS may provide short-term pain modulation/);
  assert.match(electro, /different indications and evidence bases/);
  assert.match(electro, /implanted electronic devices/);
});

test("homepage provides a contextual link to the clinician directory", async () => {
  const source = await readFile(new URL("src/components/site/MeetDoctors.tsx", repo), "utf8");
  assert.match(source, /to="\/our-team"/);
  assert.match(source, /View the full PainFix clinical team/);
});

test("published clinical internship remains in the sitemap if CMS listing temporarily fails", async () => {
  const source = await readFile(new URL("src/routes/sitemap[.]xml.ts", repo), "utf8");
  assert.match(source, /path: "\/internships\/clinical-physiotherapy-internship"/);
  assert.match(source, /internshipEntries\.some/);
});
