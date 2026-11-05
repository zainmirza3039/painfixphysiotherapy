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
  assert.match(article, /practical checklist for choosing a physiotherapist in Multan/i);
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
  assert.match(sitemap, /entry\.path !== "\/best-physiotherapist-in-multan"/);
});

test("sitemap remains available when optional dynamic listings fail", async () => {
  const sitemap = await read("src/routes/sitemap[.]xml.ts");
  assert.match(sitemap, /clinicianSlugs = \[\]/);
  assert.match(sitemap, /internshipEntries = \[\]/);
  assert.doesNotMatch(sitemap, /status: 503/);
});
