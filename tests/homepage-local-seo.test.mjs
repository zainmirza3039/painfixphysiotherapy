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

test("homepage condition introduction includes the priority rehabilitation cluster", () => {
  const conditions = source("components/site/Conditions.tsx");
  for (const phrase of ["back pain", "sciatica", "knee pain", "neck pain", "frozen shoulder", "stroke"]) {
    assert.ok(conditions.includes(phrase), `Missing homepage condition keyword: ${phrase}`);
  }
});
