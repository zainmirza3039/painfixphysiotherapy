import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("homepage features only the BMI calculator and links to the complete tools hub", async () => {
  const source = await readFile(new URL("src/components/site/HomeBmi.tsx", repo), "utf8");
  assert.match(source, /<BmiCalculator \/>/);
  assert.match(source, /to="\/health-calculators"/);
  assert.match(source, /View all health tools/);
  assert.doesNotMatch(source, /const TOOLS = \[/);
  assert.doesNotMatch(source, /Calorie Calculator|Water Intake|Protein Intake|Ideal Weight/);
});

test("header logo is rounded and the public header uses softer surfaces", async () => {
  const navbar = await readFile(new URL("src/components/site/Navbar.tsx", repo), "utf8");
  assert.match(navbar, /rounded-full border border-border\/50 bg-white shadow-sm/);
  assert.match(navbar, /bg-surface\/45/);
  assert.match(navbar, /shadow-\[0_2px_12px_rgba\(22,50,74,0\.05\)\]/);
});

test("footer social links use recognisable platform brand marks", async () => {
  const footer = await readFile(new URL("src/components/site/Footer.tsx", repo), "utf8");
  for (const brand of ["Facebook", "Instagram", "TikTok", "LinkedIn", "YouTube"]) {
    assert.ok(footer.includes(`label: "${brand}"`), `${brand} link is present`);
  }
  assert.match(footer, /function SocialBrandIcon/);
  assert.match(footer, /<SocialBrandIcon label={s.label} \/>/);
});

test("hero photo has no decorative drop shape beneath it", async () => {
  const source = await readFile(new URL("src/styles.css", repo), "utf8");
  assert.match(source, /\.home-hero__visual \{[^}]+\}/);
  assert.doesNotMatch(source, /\.home-hero__visual::before/);
  assert.match(source, /\.home-hero__image-frame \{[^}]*border: 1px solid var\(--border\)/);
});

test("homepage treatment cards use local clinic photos where available and defer image loading", async () => {
  const source = await readFile(new URL("src/components/site/Services.tsx", repo), "utf8");
  assert.match(source, /manualTherapyClinicPhoto from "@\/assets\/hero\.webp"/);
  assert.match(source, /guidedRehabClinicPhoto from "@\/assets\/clinic-photo-4\.webp"/);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /fetchPriority="low"/);
  assert.match(source, /sizes="\(min-width: 1280px\) 20vw/);
});
