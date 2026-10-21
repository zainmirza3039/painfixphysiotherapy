import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, repo), "utf8");

test("RYK landing route uses the online-only SEO page and avoids clinic schema", async () => {
  const [route, page] = await Promise.all([
    read("src/routes/physiotherapy-in-rahim-yar-khan.tsx"),
    read("src/components/site/RykOnlineLandingPage.tsx"),
  ]);
  assert.match(route, /createFileRoute\("\/physiotherapy-in-rahim-yar-khan"\)/);
  assert.match(route, /Online Physiotherapy in Rahim Yar Khan/);
  assert.match(route, /MedicalTherapy/);
  assert.match(route, /Rahim Yar Khan/);
  assert.doesNotMatch(route, /MedicalClinic/);
  assert.match(page, /Online only in RYK/);
  assert.match(page, /no physical PainFix (clinic|branch)/i);
  assert.match(page, /Ariba Babar/);
  assert.match(page, /book-appointment\?city=rahim-yar-khan&service=online/);
});

test("RYK homepage card links to the dedicated online-only landing page", async () => {
  const source = await read("src/components/site/CityServices.tsx");
  assert.match(source, /physiotherapy-in-rahim-yar-khan/);
  assert.match(source, /online only/i);
  assert.doesNotMatch(source, /Rahim Yar Khan (clinic|branch)/i);
});

test("RYK landing page is discoverable in sitemap, route manifest, and site search", async () => {
  const [sitemap, manifest, search] = await Promise.all([
    read("src/routes/sitemap[.]xml.ts"),
    read("public/manus-routes.json"),
    read("src/lib/searchIndex.ts"),
  ]);
  assert.match(sitemap, /physiotherapy-in-rahim-yar-khan/);
  assert.match(manifest, /\/physiotherapy-in-rahim-yar-khan/);
  assert.match(search, /resource-ryk-online-physiotherapy/);
});
