import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("homepage owns the primary physiotherapist in Multan search intent", async () => {
  const route = await read("src/routes/index.tsx");
  const hero = (await read("src/components/site/Hero.tsx")).replace(/\\s+/g, " ");

  assert.match(route, /const TITLE = "Physiotherapist in Multan \\| PainFix Physiotherapy Clinic"/);
  assert.match(hero, /home-hero__heading home-hero__heading--top/);
  assert.match(hero, /Physiotherapist in <span className="home-hero__accent">Multan\\./);
  assert.match(hero, /Multan clinic appointment/);
  assert.match(hero, /Need a home visit in Multan\\?/);
  assert.match(hero, /Shalimar Colony, Multan/);
  assert.doesNotMatch(hero, /home-hero__description|home-hero__visual/);
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
