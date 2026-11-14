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

test("homepage hero uses a responsive full-bleed signboard background with readable overlay", async () => {
  const [hero, route, styles] = await Promise.all([
    readFile(new URL("src/components/site/Hero.tsx", repo), "utf8"),
    readFile(new URL("src/routes/index.tsx", repo), "utf8"),
    readFile(new URL("src/styles.css", repo), "utf8"),
  ]);
  assert.ok(hero.includes("painfix-sign-960.webp"));
  assert.ok(hero.includes("painfix-sign-1800.webp"));
  assert.ok(hero.includes('fetchPriority="high"'));
  assert.ok(hero.includes('className="home-hero__heading home-hero__heading--top"'));
  assert.ok(route.includes('type: "image/webp"'));
  assert.ok(route.includes("painfixSign960"));
  assert.ok(styles.includes(".home-hero::before {"));
  assert.ok(styles.includes("linear-gradient("));
  assert.ok(styles.includes(".home-hero__background {"));
  assert.ok(styles.includes("object-fit: cover;"));
  const headingStart = styles.indexOf(".home-hero__heading {");
  const accentStart = styles.indexOf(".home-hero__accent {");
  assert.ok(styles.slice(headingStart, styles.indexOf("}", headingStart)).includes("font-weight: 700;"));
  assert.ok(styles.slice(accentStart, styles.indexOf("}", accentStart)).includes("font-weight: 700;"));
  assert.ok(styles.includes("transform: translateY(1.25rem) scale(1.35);"));
  assert.ok(!styles.includes("scale(1.75)"));
  assert.ok(styles.includes("scale(1.15)"));
  assert.ok(styles.includes("scale(1.08)"));
  assert.ok(styles.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(styles.includes("animation: none !important;"));
});

test("homepage treatment cards use real treatment-specific Pexels photos and defer image loading", async () => {
  const source = await readFile(new URL("src/components/site/Services.tsx", repo), "utf8");
  for (const photoId of ["20860597", "20860594", "6076134", "30483049", "20860580"]) {
    assert.ok(source.includes(`/photos/${photoId}/`), `treatment photo ${photoId} is mapped`);
  }
  assert.match(source, /illustrative photograph/i);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /fetchPriority="low"/);
  assert.match(source, /sizes="\(min-width: 1280px\) 20vw/);
});
