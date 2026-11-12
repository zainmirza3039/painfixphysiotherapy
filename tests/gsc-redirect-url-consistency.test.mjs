import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const auth = readFileSync(new URL("src/routes/auth.tsx", root), "utf8");
const sitemap = readFileSync(new URL("src/routes/sitemap[.]xml.ts", root), "utf8");
const constants = readFileSync(new URL("src/components/site/constants.ts", root), "utf8");
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));

test("authentication email callbacks use the preferred non-WWW HTTPS host", () => {
  assert.ok(auth.includes('emailRedirectTo: "https://painfixphysiotherapy.com/admin"'));
  assert.ok(auth.includes('redirectTo: "https://painfixphysiotherapy.com/reset-password"'));
  assert.ok(!auth.includes("www.painfixphysiotherapy.com"));
});

test("sitemap and canonical URL helper use the preferred non-WWW HTTPS host", () => {
  assert.ok(constants.includes('SITE_URL = "https://painfixphysiotherapy.com"'));
  assert.ok(sitemap.includes('const BASE_URL = "https://painfixphysiotherapy.com"'));
  assert.ok(sitemap.includes("canonicalEntries.map"));
});

test("known legacy landing redirects are not emitted in the sitemap", () => {
  for (const path of [
    "/best-physiotherapist-in-multan",
    "/physiotherapist-in-multan",
    "/physiotherapy-in-multan",
    "/physiotherapy-clinic-in-multan",
    "/services/home-physiotherapy",
  ]) {
    assert.ok(sitemap.includes(`"${path}"`), `Missing redirect exclusion: ${path}`);
  }
  assert.ok(sitemap.includes("redirectedLandingPaths.has(entry.path)"));
  assert.ok(vercel.redirects.every((rule) => rule.permanent === true));
});
