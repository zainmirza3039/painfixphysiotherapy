import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("homepage places city services immediately after the hero", async () => {
  const source = await read("src/routes/index.tsx");
  assert.match(source, /<Hero\s*\/?>[\s\S]*?<CityServices\s*\/?>[\s\S]*?<Services\s*\/?>/);
});

test("city section presents Multan clinic and home visits plus RYK online-only care", async () => {
  const source = await read("src/components/site/CityServices.tsx");
  assert.match(source, /Multan/);
  assert.match(source, /Clinic and home physiotherapy/);
  assert.match(source, /Rahim Yar Khan/);
  assert.match(source, /Online physiotherapy/);
  assert.match(source, /online only/i);
  assert.match(source, /Ariba Babar DPT/);
  assert.doesNotMatch(source, /Rahim Yar Khan (clinic|branch)/i);
});

test("homepage booking links use the city-aware appointment contract", async () => {
  const [hero, cities] = await Promise.all([
    read("src/components/site/Hero.tsx"),
    read("src/components/site/CityServices.tsx"),
  ]);
  const source = `${hero}\n${cities}`;
  for (const href of [
    "/book-appointment?city=multan&service=clinic",
    "/book-appointment?city=multan&service=home_visit",
    "/book-appointment?city=rahim-yar-khan&service=online",
  ])
    assert.match(source, new RegExp(href.replace(/[?&=]/g, "\\$&")));
  assert.match(cities, /href="\/ariba-babar"/);
});

test("homepage hero and metadata mention both cities", async () => {
  const [hero, route] = await Promise.all([
    read("src/components/site/Hero.tsx"),
    read("src/routes/index.tsx"),
  ]);
  assert.match(hero, /Physiotherapy in Multan and Rahim Yar Khan/);
  assert.match(route, /PainFix Physiotherapy in Multan & Rahim Yar Khan/);
  assert.match(route, /Ariba Babar DPT/);
});

test("city palette stays on the requested navy and green tokens", async () => {
  const source = await read("src/components/site/CityServices.tsx");
  assert.match(source, /bg-primary/);
  assert.match(source, /#00A859/);
});
