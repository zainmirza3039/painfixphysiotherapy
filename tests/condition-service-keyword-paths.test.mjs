import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (path) => readFileSync(new URL("../src/" + path, import.meta.url), "utf8");
const normalize = (value) => value.replace(/\\s+/g, " ").trim();

test("condition pages provide direct local clinic and home-visit booking paths", () => {
  const route = normalize(source("routes/conditions.$slug.tsx"));
  assert.ok(route.includes('to="/physiotherapist-in-multan"'));
  assert.ok(route.includes('to="/home-visit"'));
  assert.ok(route.includes("Book a Physiotherapy Assessment in Multan"));
});

test("home physiotherapy service page routes booking to the dedicated home-visit page", () => {
  const route = normalize(source("routes/services.$slug.tsx"));
  const fees = source("data/serviceFees.ts");
  assert.ok(route.includes('service.slug === "home-physiotherapy"'));
  assert.ok(route.includes('to="/home-visit"'));
  assert.ok(route.includes("SERVICE_FEES.homeVisit.displayPrice"));
  assert.ok(fees.includes('description: "Includes one treatment session and travel."'));
});

test("sciatica page avoids claiming manual therapy physically reduces nerve compression", () => {
  const conditions = source("data/conditions.ts");
  assert.ok(!conditions.includes("Manual therapy to reduce nerve compression"));
  assert.ok(conditions.includes("Appropriate manual techniques, when indicated, to support symptom relief and movement tolerance"));
  assert.ok(conditions.includes("Recovery varies with the cause, symptom duration and neurological involvement."));
});

test("existing condition keyword ownership and canonical route remain unchanged", () => {
  const conditions = source("data/conditions.ts");
  const route = source("routes/conditions.$slug.tsx");
  for (const [slug, title] of [
    ["back-pain", "Back Pain Treatment in Multan | Physiotherapy — PainFix"],
    ["sciatica", "Sciatica Treatment in Multan | Physiotherapy — PainFix"],
    ["frozen-shoulder", "Frozen Shoulder Treatment in Multan | Physiotherapy — PainFix"],
    ["knee-pain", "Knee Pain Treatment in Multan | Physiotherapy — PainFix"],
    ["slipped-disc", "Slipped Disc Treatment in Multan | Physiotherapy — PainFix"],
    ["stroke-rehabilitation", "Stroke Rehabilitation in Multan | Physiotherapy — PainFix"],
  ]) {
    assert.ok(conditions.includes('slug: "' + slug + '"'));
    assert.ok(conditions.includes('metaTitle: "' + title + '"'));
  }
  assert.ok(route.includes("canonical(path)"));
});
