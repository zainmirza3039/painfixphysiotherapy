import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("homepage owns the primary physiotherapist in Multan search intent", async () => {
  const route = await read("src/routes/index.tsx");
  const hero = (await read("src/components/site/Hero.tsx")).replace(/\s+/g, " ");

  assert.match(route, /const TITLE = "Physiotherapist in Multan \| PainFix Physiotherapy Clinic"/);
  assert.match(hero, /Physiotherapist[\s\S]*?home-hero__accent">Multan\./);
  assert.match(
    hero,
    /Looking for a physiotherapist in Multan or a physiotherapy clinic near you\?/,
  );
  assert.match(hero, /Move Better\. Recover Faster\. Live Pain-Free\./);
  assert.doesNotMatch(hero, /DPT-led assessment and rehabilitation/);
});

test("physiotherapist booking landing page remains a distinct canonical route", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.equal(
    config.redirects.some((redirect) => redirect.source === "/physiotherapist-in-multan"),
    false,
  );
  const bookingRoute = await read("src/routes/physiotherapist-in-multan.tsx");
  const localPages = await read("src/data/localPages.ts");
  assert.match(bookingRoute, /createFileRoute\("\/physiotherapist-in-multan"\)/);
  assert.match(bookingRoute, /localPageHead\(page\)/);
  assert.match(localPages, /slug: "physiotherapist-in-multan"/);
  assert.match(localPages, /title: "Book a Physiotherapist in Multan"/);
});
