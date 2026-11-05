import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("homepage keeps the primary Multan physiotherapist keyword and canonical URL", () => {
  const home = source("routes/index.tsx");
  const hero = source("components/site/Hero.tsx");
  assert.match(home, /Physiotherapist in Multan \\| PainFix Physiotherapy Clinic/);
  assert.match(home, /canonical", href: \`\$\{SITE_URL\}\/\`/);
  assert.match(hero, /<h1[\\s\\S]*?Physiotherapist[\\s\\S]*?in <span className="home-hero__accent">Multan\\.<\\/span>/);
});

test("homepage metadata covers the clinic and core treatment-intent cluster without keyword stuffing", () => {
  const home = source("routes/index.tsx");
  assert.match(home, /physiotherapy clinic in Shalimar Colony, Multan/);
  assert.match(home, /back pain, sciatica, knee or neck pain/);
  assert.match(home, /selected home visits/);
});

test("homepage hero naturally supports local clinic and home-visit searches", () => {
  const hero = source("components/site/Hero.tsx");
  assert.match(hero, /physiotherapist in Multan or a physiotherapy clinic near you/);
  assert.match(hero, /home physiotherapy visits across Multan/);
});

test("homepage condition introduction includes the priority rehabilitation cluster", () => {
  const conditions = source("components/site/Conditions.tsx");
  for (const phrase of ["back pain", "sciatica", "knee pain", "neck pain", "frozen shoulder", "stroke"]) {
    assert.ok(conditions.includes(phrase), `Missing homepage condition keyword: ${phrase}`);
  }
});
