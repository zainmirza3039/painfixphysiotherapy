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
  assert.doesNotMatch(hero, /Move Better\. Recover Faster\. Live Pain-Free\./);
  assert.doesNotMatch(hero, /DPT-led assessment and rehabilitation/);
});

test("broad physiotherapist landing URL redirects home while booking stays on its dedicated route", async () => {
  const config = JSON.parse(await read("vercel.json"));
  assert.ok(
    config.redirects.some(
      (redirect) =>
        redirect.source === "/physiotherapist-in-multan" &&
        redirect.destination === "/" &&
        redirect.permanent,
    ),
  );
  const bookingRoute = await read("src/routes/book-appointment.tsx");
  assert.ok(bookingRoute.includes('createFileRoute("/book-appointment")'));
});
