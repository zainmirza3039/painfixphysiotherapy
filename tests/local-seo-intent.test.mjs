import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("physiotherapist choice article targets informational intent, not the local booking query", async () => {
  const source = await read("src/data/blog.ts");
  const start = source.indexOf('slug: "best-physiotherapist-in-multan"');
  assert.notEqual(start, -1);
  const end = source.indexOf("\n  },", start);
  const article = source.slice(start, end);

  assert.ok(article.includes('title: "How to Choose a Physiotherapist in Multan"'));
  assert.ok(article.includes('seoTitle: "How to Choose a Physiotherapist in Multan | PainFix"'));
  assert.match(article, /updated: "2026-11-05"/);
  assert.match(article, /choose a physiotherapist in Multan/i);
  assert.doesNotMatch(article, /seoTitle: "Best Physiotherapist in Multan/);
});

test("root-level best physiotherapist landing URL consolidates to the homepage", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.ok(
    config.redirects.some(
      (rule) =>
        rule.source === "/best-physiotherapist-in-multan" &&
        rule.destination === "/" &&
        rule.permanent === true,
    ),
  );
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  const localPages = await read("src/data/localPages.ts");
  assert.match(localPages, /slug: "physiotherapist-in-multan"/);
  assert.match(sitemap, /new Set\(\["\/best-physiotherapist-in-multan"\]\)/);
  assert.match(sitemap, /redirectedLandingPaths\.has\(entry\.path\)/);
  assert.doesNotMatch(sitemap, /"\/physiotherapist-in-multan"/);
});

test("sitemap remains available when optional dynamic listings fail", async () => {
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /clinicianSlugs = \[\]/);
  assert.match(sitemap, /internshipEntries = \[\]/);
  assert.doesNotMatch(sitemap, /status: 503/);
});

test("Multan physiotherapy service page links to booking and home-visit journeys", async () => {
  const component = await read("src/components/site/LocalLandingPage.tsx");
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(component, /page\.slug === "physiotherapy-in-multan"/);
  assert.match(component, /to="\\/physiotherapist-in-multan"/);
  assert.match(component, /to="\\/home-visit"/);
  assert.match(sitemap, /\.\.\.localPages\.map/);
});

test("homepage, service-information and booking pages retain distinct page intent", async () => {
  const homepage = await read("src/routes/index.tsx");
  const localPages = await read("src/data/localPages.ts");
  assert.match(homepage, /const TITLE = "Physiotherapist in Multan \\| PainFix Physiotherapy Clinic"/);
  assert.match(localPages, /metaTitle: "Physiotherapy in Multan \\| PainFix Clinic"/);
  assert.match(localPages, /metaTitle: "Book a Physiotherapist in Multan \\| PainFix Clinic"/);
  assert.match(localPages, /heading: "Physiotherapy services in Multan"/);
  assert.match(localPages, /heading: "What happens at your first physiotherapy appointment\\?"/);
});
