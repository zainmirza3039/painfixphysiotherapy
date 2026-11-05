import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("homepage owns the primary physiotherapist in Multan search intent", async () => {
  const route = await read("src/routes/index.tsx");
  const hero = await read("src/components/site/Hero.tsx");

  assert.ok(route.includes('const TITLE = "Physiotherapist in Multan | PainFix Physiotherapy Clinic"'));
  assert.ok(hero.includes("Physiotherapist"));
  assert.ok(hero.includes('home-hero__accent">Multan.'));
  assert.ok(hero.includes("Looking for a physiotherapist in Multan or a physiotherapy clinic near you?"));
  assert.ok(hero.includes("Move Better. Recover Faster. Live Pain-Free."));
  assert.ok(!hero.includes("DPT-led assessment and rehabilitation"));
});

test("former physiotherapist booking landing URL permanently redirects to homepage", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.ok(
    config.redirects.some(
      (redirect) =>
        redirect.source === "/physiotherapist-in-multan" &&
        redirect.destination === "/" &&
        redirect.permanent === true,
    ),
  );
});
