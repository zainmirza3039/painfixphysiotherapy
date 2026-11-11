import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const vercel = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
const sitemap = readFileSync(new URL("src/routes/sitemap[.]xml.ts", root), "utf8");
const bookingRoute = readFileSync(
  new URL("src/routes/physiotherapist-in-multan.tsx", root),
  "utf8",
);
const translations = readFileSync(new URL("src/i18n/translations.ts", root), "utf8");
const homeVisitRoute = readFileSync(new URL("src/routes/home-visit.tsx", root), "utf8");

test("booking-intent landing page is no longer redirected to the homepage", () => {
  assert.equal(
    vercel.redirects.some((rule) => rule.source === "/physiotherapist-in-multan"),
    false,
  );
  assert.ok(bookingRoute.includes('createFileRoute("/physiotherapist-in-multan")'));
  assert.ok(bookingRoute.includes("localPageHead(page)"));
});

test("booking landing page remains eligible for the canonical sitemap", () => {
  assert.ok(sitemap.includes("...localPages.map"));
  assert.ok(sitemap.includes('new Set(["/best-physiotherapist-in-multan"])'));
  assert.ok(!sitemap.includes('"physiotherapist-in-multan",'));
});

test("home-visit page lists only the confirmed Multan coverage areas in both languages", () => {
  for (const area of [
    "Royal Orchard",
    "DHA Multan",
    "Bosan Road",
    "MDA Chowk",
    "Nagana Chowk",
    "Wapda Town",
    "Shalimar Colony",
  ]) {
    assert.ok(translations.includes(area), `Missing area: ${area}`);
  }
  assert.ok(
    translations.includes("گھر پر فزیوتھراپی کے وزٹس ملتان کے منتخب علاقوں میں دستیاب ہیں"),
  );
  assert.ok(homeVisitRoute.includes("Royal Orchard, DHA Multan, Bosan Road and nearby areas"));
});
