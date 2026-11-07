import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const sourceFiles = [
  "src/data/localPages.ts",
  "src/data/services.ts",
  "src/data/conditions.ts",
  "src/data/fitness.ts",
  "src/data/wellness.ts",
  "src/data/blog.ts",
  "src/data/team.ts",
  "src/routes/about.tsx",
  "src/routes/index.tsx",
  "src/routes/search.tsx",
  "src/routes/contact.tsx",
  "src/routes/gallery.tsx",
  "src/routes/our-team.tsx",
  "src/routes/membership.tsx",
  "src/routes/home-visit.tsx",
  "src/routes/fitness.index.tsx",
  "src/routes/services.index.tsx",
  "src/routes/success-stories.tsx",
  "src/routes/book-appointment.tsx",
  "src/routes/conditions.index.tsx",
  "src/routes/fitness-resources.tsx",
  "src/routes/clinical-resources.tsx",
  "src/routes/fitness-assessment.tsx",
  "src/routes/health-calculators.tsx",
  "src/routes/physiotherapy-in-rahim-yar-khan.tsx",
  "src/lib/doctor-seo.ts",
];

test("literal static meta descriptions stay within 160 characters", async () => {
  const overlong = [];

  for (const path of sourceFiles) {
    const source = await readFile(new URL(path, repo), "utf8");
    const matches = source.matchAll(/(?:metaDescription|DESCRIPTION)\s*[:=]\s*(["'])([\s\S]*?)\1/g);

    for (const match of matches) {
      const description = match[2].replace(/\s+/g, " ").trim();
      if (description.length > 160) {
        overlong.push(path + ": " + description.length + " characters — " + description);
      }
    }
  }

  assert.deepEqual(overlong, [], overlong.join("\n"));
});
