import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("homepage keeps the primary Multan physiotherapist keyword and canonical URL", () => {
  const home = source("routes/index.tsx");
  const hero = source("components/site/Hero.tsx");
  assert.ok(home.includes('const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic"'));
  assert.ok(home.includes('rel: "canonical", href: `${SITE_URL}/`'));
  assert.ok(hero.includes("Physiotherapist"));
  assert.ok(hero.includes('home-hero__accent">Multan.'));
});

test("homepage metadata covers the clinic and core treatment-intent cluster without keyword stuffing", () => {
  const home = source("routes/index.tsx");
  assert.ok(home.includes("physiotherapy clinic in Shalimar Colony, Multan"));
  assert.ok(home.includes("back pain, sciatica, knee or neck pain"));
  assert.ok(home.includes("selected home visits"));
});

test("homepage hero naturally supports local clinic and home-visit searches", () => {
  const hero = source("components/site/Hero.tsx");
  assert.ok(hero.includes("physiotherapist in Multan or a physiotherapy clinic near you"));
  assert.ok(hero.includes("home physiotherapy visits across Multan"));
});

test("homepage links priority condition keywords to their own dedicated condition URLs", () => {
  const conditions = source("components/site/Conditions.tsx");
  for (const phrase of ["back pain", "sciatica", "knee pain", "neck pain", "frozen shoulder", "stroke"]) {
    assert.ok(conditions.includes(phrase), `Missing homepage condition keyword: ${phrase}`);
  }
  assert.ok(conditions.includes('conditionSlug: "slipped-disc"'));
  assert.ok(conditions.includes('to="/conditions/$slug"'));
});

test("dedicated condition pages retain canonical metadata and are included through the sitemap data", () => {
  const route = source("routes/conditions.$slug.tsx");
  const sitemap = source("routes/sitemap[.]xml.ts");
  const data = source("data/conditions.ts");
  assert.ok(route.includes("getCondition(params.slug)"));
  assert.ok(route.includes("canonical(path)"));
  assert.ok(sitemap.includes("...conditions.map((c)"));
  assert.ok(data.includes('metaTitle: "Stroke Rehabilitation in Multan | Physiotherapy — PainFix"'));
  for (const slug of ["back-pain", "sciatica", "knee-pain", "neck-pain", "frozen-shoulder", "slipped-disc", "stroke-rehabilitation"]) {
    assert.ok(data.includes(`slug: "${slug}"`), `Missing dedicated condition page data: ${slug}`);
  }
});
