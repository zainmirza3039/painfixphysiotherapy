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

test("hero uses a restrained solid green accent and a neutral image border", async () => {
  const source = await readFile(new URL("src/styles.css", repo), "utf8");
  const visual = source.match(/\.home-hero__visual \{[^}]+\}/)?.[0] ?? "";
  const accent = source.match(/\.home-hero__visual::before \{[^}]+\}/)?.[0] ?? "";
  const frame = source.match(/\.home-hero__image-frame \{[^}]+\}/)?.[0] ?? "";

  assert.match(visual, /isolation: isolate/);
  assert.match(accent, /background: color-mix\(in oklab, var\(--secondary\) 13%, var\(--background\)\)/);
  assert.doesNotMatch(accent, /linear-gradient|filter: blur/);
  assert.match(frame, /border: 1px solid var\(--border\)/);
  assert.doesNotMatch(frame, /border-left: 6px/);
});
