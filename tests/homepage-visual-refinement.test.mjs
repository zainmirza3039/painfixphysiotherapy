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
  assert.match(hero, /painfix-sign-960\\.webp/);
  assert.match(hero, /painfix-sign-1800\\.webp/);
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /home-hero__heading home-hero__heading--top/);
  assert.match(route, /type: "image\\/webp"[\\s\\S]*imageSrcSet:[\\s\\S]*painfixSign960/);
  assert.match(styles, /\\.home-hero::before \\{[\\s\\S]*?linear-gradient/);
  assert.match(styles, /\\.home-hero__background \\{[\\s\\S]*?object-fit: cover/);
  assert.match(styles, /\\.home-hero__heading \\{[^}]*font-weight: 700/);
  assert.match(styles, /\\.home-hero__accent \\{[^}]*font-weight: 700/);
  assert.match(styles, /@media \\(min-width: 981px\\)[\\s\\S]*?transform: translateY\\(1\\.25rem\\) scale\\(1\\.35\\)/);
  assert.doesNotMatch(styles, /scale\\(1\\.75\\)/);
  assert.match(styles, /@media \\(max-width: 767px\\)[\\s\\S]*?scale\\(1\\.08\\)/);
  assert.match(styles, /@media \\(prefers-reduced-motion: reduce\\)[\\s\\S]*?\\.home-hero__content \\{\\s*animation: none !important/);
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
