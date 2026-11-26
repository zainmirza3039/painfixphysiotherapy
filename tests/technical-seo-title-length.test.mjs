import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("all titles identified by the November technical audit are within 60 characters", async () => {
  const cases = [
    ["src/routes/fitness-assessment.tsx", "Free Fitness Assessment in Multan | PainFix"],
    ["src/routes/health-calculators.tsx", "Free Health Calculators | PainFix Multan"],
    ["src/routes/privacy.tsx", "Privacy & Cookie Policy | PainFix Multan"],
    ["src/routes/terms.tsx", "Terms of Service & Medical Disclaimer | PainFix"],
    ["src/data/services.ts", "Exercise Therapy in Multan | PainFix"],
  ];

  for (const [path, expectedTitle] of cases) {
    const source = await read(path);
    assert.ok(source.includes(expectedTitle), path + " should use the concise title");
    assert.ok(expectedTitle.length <= 60, path + " title must stay within 60 characters");
  }
});

test("the primary homepage title remains unchanged by secondary-page snippet cleanup", async () => {
  const homepage = await read("src/routes/index.tsx");
  assert.ok(homepage.includes('const TITLE = "Best Physiotherapist in Multan | PainFix Clinic"'));
});
