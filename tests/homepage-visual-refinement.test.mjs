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

test("public header is compact, keeps the rounded brand mark and opens contextual navigation", async () => {
  const navbar = await readFile(new URL("src/components/site/Navbar.tsx", repo), "utf8");
  assert.match(navbar, /rounded-full border border-border\/50 bg-white shadow-sm/);
  assert.match(navbar, /fixed inset-x-0 top-0 z-50/);
  assert.match(navbar, /DialogPrimitive\.Content/);
  assert.match(navbar, /Explore PainFix/);
  assert.match(navbar, /transition-\[height,padding,box-shadow\]/);
  assert.doesNotMatch(navbar, /backdrop-blur/);
});

test("footer social links use recognisable platform brand marks", async () => {
  const footer = await readFile(new URL("src/components/site/Footer.tsx", repo), "utf8");
  for (const brand of ["Facebook", "Instagram", "TikTok", "LinkedIn", "YouTube"]) {
    assert.ok(footer.includes(\`label: "\${brand}"\`), \`\${brand} link is present\`);
  }
  assert.match(footer, /function SocialBrandIcon/);
  assert.match(footer, /<SocialBrandIcon label=\{s.label\} \/>/);
});

test("homepage hero retains the earlier soft green art direction and photo edge", async () => {
  const source = await readFile(new URL("src/styles.css", repo), "utf8");
  assert.match(source, /\.home-hero \{[^}]*background: var\(--surface\)/);
  assert.match(source, /\.home-hero__visual::before/);
  assert.match(source, /background: color-mix\(in srgb, var\(--secondary\) 9%, var\(--background\)\)/);
  assert.match(source, /\.home-hero__image-frame \{[^}]*border-left: 5px solid var\(--brand-green\)/);
  assert.match(source, /border-radius: 0 1rem 1rem 0/);
});

test("homepage treatment cards use real treatment-specific Pexels photos and defer image loading", async () => {
  const source = await readFile(new URL("src/components/site/Services.tsx", repo), "utf8");
  for (const photoId of ["20860597", "20860594", "6076134", "30483049", "20860580"]) {
    assert.ok(source.includes(\`/photos/\${photoId}/\`), \`treatment photo \${photoId} is mapped\`);
  }
  assert.match(source, /illustrative photograph/i);
  assert.match(source, /loading="lazy"/);
  assert.match(source, /fetchPriority="low"/);
  assert.match(source, /sizes="\(min-width: 1280px\) 20vw/);
});
