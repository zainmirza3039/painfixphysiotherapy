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

test("homepage hero uses a full-bleed natural-colour sign photo with overlaid text", async () => {
  const [hero, route, styles] = await Promise.all([
    readFile(new URL("src/components/site/Hero.tsx", repo), "utf8"),
    readFile(new URL("src/routes/index.tsx", repo), "utf8"),
    readFile(new URL("src/styles.css", repo), "utf8"),
  ]);
  assert.match(hero, /painfix-sign-960\.webp/);
  assert.match(hero, /painfix-sign-1800\.webp/);
  assert.match(hero, /fetchPriority="high"/);
  assert.doesNotMatch(hero, /Move Better\. Recover Faster\. Live Pain-Free\./);
  assert.match(route, /type: "image\/webp"[\s\S]*imageSrcSet:[\s\S]*painfixSign960/);
  assert.match(styles, /\.home-hero::before \{[^}]*linear-gradient/);
  assert.match(styles, /\.home-hero::before \{[\s\S]*?rgb\(0 0 0 \/ 76%\)[\s\S]*?transparent 72%/);
  assert.doesNotMatch(styles, /rgb\(3 46 97 \/ 94%\)/);
  assert.match(
    styles,
    /\.home-hero__background \{[^}]*inset: 0;[^}]*width: 100%;[^}]*height: 100%;[^}]*object-fit: cover/,
  );
  assert.doesNotMatch(styles, /\.home-hero__background \{\s*width: (?:50|42)%;/);
  assert.match(styles, /\.home-hero__inner \{[^}]*align-items: flex-end/);
  assert.match(styles, /\.home-hero__content \{[^}]*max-width: 58rem/);
  assert.match(
    styles,
    /@media \(min-width: 981px\)[\s\S]*?\.home-hero__background \{[^}]*object-position: center 34%;[^}]*transform: scale\(1\.32\)/,
  );
  assert.match(
    styles,
    /@media \(min-width: 981px\) and \(max-width: 1199px\)[\s\S]*?transform: scale\(1\.16\)/,
  );
  assert.match(
    styles,
    /@media \(max-width: 767px\)[\s\S]*?\.home-hero \{\s*min-height: max\(100svh, 48rem\);/,
  );
  assert.match(
    styles,
    /\.home-hero__inner \{\s*min-height: max\(100svh, 48rem\);/,
  );
  assert.match(
    styles,
    /@media \(min-width: 1024px\)[\s\S]*?\.site-footer \{\s*padding-bottom: 2rem;/,
  );
  assert.match(
    styles,
    /\.site-footer > div > \.grid \{[^}]*grid-template-columns: minmax\(0, 1\.15fr\) minmax\(13rem, 0\.85fr\) minmax\(0, 1\.15fr\)/,
  );
  assert.match(styles, /\.site-footer > div > \.grid > div \{\s*grid-column: auto;/);
  const mobileRules = styles.match(/@media \(max-width: 767px\) \{([\s\S]*?)\n\}/);
  assert.ok(mobileRules, "mobile hero styles exist");
  assert.match(mobileRules[1], /\.home-hero__background \{\s*object-position: center center;/);
  assert.match(
    mobileRules[1],
    /\.home-hero__inner \{[^}]*align-items: flex-end;[^}]*padding: 7rem 1\.25rem 2rem;/,
  );
  assert.match(mobileRules[1], /animation: home-hero-content-enter 650ms/);
  assert.match(styles, /@keyframes home-hero-content-enter[\s\S]*?translateY\(18px\)[\s\S]*?opacity: 1/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.home-hero__content \{\s*animation: none !important;/,
  );
  assert.doesNotMatch(styles, /\.home-hero__image-frame|\.home-hero__visual/);
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
