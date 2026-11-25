import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("retired RYK landing URL returns not found instead of redirecting to the homepage", async () => {
  const route = await read("src/routes/physiotherapy-in-rahim-yar-khan.tsx");
  assert.match(route, /notFound\(\)/);
  assert.doesNotMatch(route, /redirect\(/);
  assert.doesNotMatch(route, /MedicalTherapy|MedicalClinic|Ariba Babar/);
});

test("retired Multan commercial URLs use explicit permanent 301 redirects to the homepage", async () => {
  const config = JSON.parse(await read("vercel.json"));
  const redirects = new Map(config.redirects.map((rule) => [rule.source, rule]));
  for (const source of [
    "/best-physiotherapist-in-multan",
    "/physiotherapist-in-multan",
    "/physiotherapy-in-multan",
    "/physiotherapy-clinic-in-multan",
  ]) {
    assert.equal(redirects.get(source)?.destination, "/");
    assert.equal(redirects.get(source)?.statusCode, 301);
    assert.equal("permanent" in redirects.get(source), false);
  }
  assert.equal(redirects.has("/physiotherapy-in-rahim-yar-khan"), false);
});

test("RYK is absent from public navigation, sitemap, and site search", async () => {
  const [homepage, hero, booking, sitemap, manifest, search, llms] = await Promise.all([
    read("src/components/site/CityServices.tsx"),
    read("src/components/site/Hero.tsx"),
    read("src/routes/book-appointment.tsx"),
    read("src/routes/sitemap[.]xml.ts"),
    read("public/manus-routes.json"),
    read("src/lib/searchIndex.ts"),
    read("public/llms.txt"),
  ]);
  for (const source of [homepage, hero, booking, sitemap, manifest, search, llms]) {
    assert.doesNotMatch(
      source,
      /Rahim Yar Khan|rahim-yar-khan|resource-ryk-online-physiotherapy|Ariba Babar/,
    );
  }
});

test("the former RYK clinician profile is hidden without deleting its record", async () => {
  const migration = await read("supabase/migrations/20261125170000_hide_ryk_clinician_profile.sql");
  assert.match(migration, /UPDATE public\.clinician_profiles/);
  assert.match(migration, /SET is_published = false/);
  assert.match(migration, /WHERE slug = 'dr-areeba-babar-pt'/);
  assert.doesNotMatch(migration, /DELETE|DROP TABLE|TRUNCATE/i);
});
