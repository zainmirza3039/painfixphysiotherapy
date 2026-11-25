import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

const retiredCityRoutes = [
  "physiotherapy-in-multan",
  "physiotherapist-in-multan",
  "best-physiotherapist-in-multan",
  "physiotherapy-clinic-in-multan",
];

test("overlapping Multan city-intent routes redirect to the primary homepage", async () => {
  const routes = await Promise.all(
    retiredCityRoutes.map((slug) => read("src/routes/" + slug + ".tsx")),
  );
  for (const route of routes) {
    assert.match(route, /beforeLoad:\s*\(\)\s*=>\s*\{/);
    assert.match(route, /redirect\(\{ to: "\/" \}\)/);
    assert.match(route, /component:\s*\(\)\s*=>\s*null/);
  }
});

test("retired city landing pages are absent from sitemap and site search data", async () => {
  const [localPages, sitemap, searchIndex] = await Promise.all([
    read("src/data/localPages.ts"),
    read("src/routes/sitemap[.]xml.ts"),
    read("src/lib/searchIndex.ts"),
  ]);
  assert.match(localPages, /export const localPages: LocalPage\[\] = \[\]/);
  for (const slug of retiredCityRoutes) {
    assert.ok(sitemap.includes('"/' + slug + '"'));
  }
  assert.match(searchIndex, /for \(const l of localPages\)/);
});

test("homepage remains the primary local-intent canonical page", async () => {
  const homepage = await read("src/routes/index.tsx");
  assert.match(homepage, /Best Physiotherapist in Multan \| PainFix Physiotherapy Clinic/);
  assert.match(homepage, /rel: "canonical"/);
  assert.match(homepage, /href: `\$\{SITE_URL\}\/`/);
});
