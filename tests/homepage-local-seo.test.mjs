import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../src/" + path, import.meta.url), "utf8");
const normalize = (value) => value.replace(/\s+/g, " ").trim();

test("homepage keeps the primary Multan physiotherapist keyword and canonical URL", () => {
  const home = source("routes/index.tsx");
  const hero = source("components/site/Hero.tsx");
  assert.ok(
    home.includes('const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic"'),
  );
  assert.ok(home.includes('rel: "canonical", href:') && home.includes("SITE_URL"));
  assert.ok(hero.includes("Physiotherapist"));
  assert.ok(hero.includes('home-hero__accent">Multan.'));
});

test("homepage metadata covers the clinic and core treatment-intent cluster without keyword stuffing", () => {
  const home = source("routes/index.tsx");
  assert.ok(home.includes("PainFix Physiotherapy Clinic in Shalimar Colony, Multan"));
  assert.ok(home.includes("back pain, sciatica, knee pain, injuries"));
  assert.ok(home.includes("home visits."));
});

test("homepage hero naturally supports local clinic and home-visit searches", () => {
  const hero = normalize(source("components/site/Hero.tsx"));
  assert.ok(hero.includes("physiotherapist in Multan or a physiotherapy clinic near you"));
  assert.ok(hero.includes("home physiotherapy visits across Multan"));
});

test("homepage links priority condition keywords to their own dedicated condition URLs", () => {
  const conditions = normalize(source("components/site/Conditions.tsx"));
  for (const phrase of [
    "back pain",
    "sciatica",
    "knee pain",
    "neck pain",
    "frozen shoulder",
    "stroke",
  ]) {
    assert.ok(
      conditions.toLowerCase().includes(phrase),
      "Missing homepage condition keyword: " + phrase,
    );
  }
  for (const slug of [
    "back-pain",
    "sciatica",
    "knee-pain",
    "neck-pain",
    "frozen-shoulder",
    "slipped-disc",
    "stroke-rehabilitation",
  ]) {
    assert.ok(
      conditions.includes('conditionSlug: "' + slug + '"'),
      "Missing homepage link to condition page: " + slug,
    );
  }
  assert.ok(conditions.includes('to="/conditions/$slug"'));
});

test("dedicated condition pages retain canonical metadata and are included through the sitemap data", () => {
  const route = source("routes/conditions.$slug.tsx");
  const sitemap = source("routes/sitemap[.]xml.ts");
  const data = source("data/conditions.ts");
  assert.ok(route.includes("getCondition(params.slug)"));
  assert.ok(route.includes("canonical(path)"));
  assert.ok(sitemap.includes("...conditions.map((c)"));
  assert.ok(
    data.includes('metaTitle: "Stroke Rehabilitation in Multan | Physiotherapy — PainFix"'),
  );
  for (const slug of [
    "back-pain",
    "sciatica",
    "knee-pain",
    "neck-pain",
    "frozen-shoulder",
    "slipped-disc",
    "stroke-rehabilitation",
  ]) {
    assert.ok(
      data.includes('slug: "' + slug + '"'),
      "Missing dedicated condition page data: " + slug,
    );
  }
});
