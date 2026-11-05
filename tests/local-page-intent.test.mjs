import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("physiotherapist local page targets appointment booking, not best-provider comparison", async () => {
  const source = await readFile(new URL("src/data/localPages.ts", repo), "utf8");
  const component = await readFile(new URL("src/components/site/LocalLandingPage.tsx", repo), "utf8");
  const start = source.indexOf('slug: "physiotherapist-in-multan"');
  const end = source.indexOf("\n  {\n    slug:", start + 1);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const page = source.slice(start, end);

  assert.ok(page.includes('title: "Book a Physiotherapist in Multan"'));
  assert.ok(page.includes('metaTitle: "Book a Physiotherapist in Multan | PainFix Clinic"'));
  assert.match(page, /first physiotherapy appointment/i);
  assert.match(page, /How do I book a physiotherapy assessment at PainFix\?/);
  assert.doesNotMatch(page, /Who is the best physiotherapist in Multan\?/);
  assert.match(component, /page\\.slug === "physiotherapist-in-multan"/);
  assert.match(component, /to="\\/book-appointment"/);
  assert.match(component, /city: "multan", service: "clinic"/);
  assert.match(component, /Book a Clinic Appointment/);
});
