import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("high-intent slipped-disc and shoulder-pain condition pages are registered", async () => {
  const source = await read("src/data/conditions.ts");
  for (const slug of ["slipped-disc", "shoulder-pain"]) {
    assert.ok(source.includes(`slug: "${slug}"`));
  }
  assert.match(source, /Slipped Disc Treatment in Multan/);
  assert.match(source, /Shoulder Pain Treatment in Multan/);
});

test("slipped-disc page includes cauda equina emergency guidance", async () => {
  const source = await read("src/data/conditions.ts");
  assert.match(source, /bladder or bowel dysfunction/);
  assert.match(source, /saddle-area numbness/);
  assert.match(source, /rapidly progressive leg weakness/);
  const route = await read("src/routes/conditions.$slug.tsx");
  assert.match(route, /When to seek urgent medical care/);
  assert.match(route, /role="alert"/);
});

test("new condition pages have matching visual references and existing service links", async () => {
  const gallery = await read("src/data/conditionImageGallery.ts");
  const services = await read("src/data/services.ts");
  assert.ok(gallery.includes('"slipped-disc": [slippedDiscVisual]'));
  assert.match(gallery, /"shoulder-pain":/);
  for (const slug of [
    "manual-therapy",
    "exercise-therapy",
    "pain-management",
    "posture-ergonomic-assessment",
  ]) {
    assert.ok(services.includes(`slug: "${slug}"`));
  }
});

test("disc and rotator-cuff articles link to their matching condition pages", async () => {
  const source = await read("src/data/blog.ts");
  const discStart = source.indexOf('slug: "disc-herniation-treatment"');
  const shoulderStart = source.indexOf('slug: "rotator-cuff-rehabilitation"');
  assert.notEqual(discStart, -1);
  assert.notEqual(shoulderStart, -1);
  const discBlock = source.slice(discStart, source.indexOf("\\n  },", discStart));
  const shoulderBlock = source.slice(shoulderStart, source.indexOf("\\n  },", shoulderStart));
  assert.match(discBlock, /relatedConditions: \\[.*"slipped-disc"/);
  assert.match(shoulderBlock, /relatedConditions: \\[.*"shoulder-pain"/);
});
