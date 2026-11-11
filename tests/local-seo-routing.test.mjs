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

test("home-visit page confirms Multan-wide coverage in both languages and keeps areas as examples", () => {
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
  assert.ok(translations.includes("Home physiotherapy visits are offered across Multan."));
  assert.ok(translations.includes("گھر پر فزیوتھراپی کے وزٹس پورے ملتان میں فراہم کیے جاتے ہیں۔"));
  assert.ok(homeVisitRoute.includes("PainFix provides home physiotherapy visits across Multan."));
  assert.ok(homeVisitRoute.includes("Coverage includes areas such as Royal Orchard, DHA Multan"));
  assert.ok(
    homeVisitRoute.includes(
      "PainFix ملتان کے تمام علاقوں میں گھر پر فزیوتھراپی وزٹس فراہم کرتا ہے۔",
    ),
  );
});
