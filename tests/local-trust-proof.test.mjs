import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("Multan local landing pages use real clinic photography and live Google review links", async () => {
  const [page, constants] = await Promise.all([
    readFile(new URL("src/components/site/LocalLandingPage.tsx", repo), "utf8"),
    readFile(new URL("src/components/site/constants.ts", repo), "utf8"),
  ]);

  assert.match(page, /@\/assets\/clinic-exterior\.webp/);
  assert.match(page, /PainFix Physiotherapy Clinic storefront in Shalimar Colony, Multan/);
  assert.match(page, /GOOGLE_BUSINESS_PROFILE_URL/);
  assert.match(page, /GOOGLE_REVIEW_URL/);
  assert.match(page, /Read current patient feedback directly on PainFix’s Google Business Profile/);
  assert.match(page, /Ratings and review counts are maintained by Google/);
  assert.match(page, /CLINIC_ADDRESS/);
  assert.match(page, /OPENING_HOURS\.map/);
  assert.match(constants, /export const GOOGLE_BUSINESS_PROFILE_URL = "https:\/\/maps\.google\.com\/?cid=/);
  assert.match(constants, /export const GOOGLE_REVIEW_URL = "https:\/\/g\.page\//);

  // Keep the page evergreen: do not hardcode a review count or rating snapshot.
  assert.doesNotMatch(page, /4\.9★|31 reviews|44 reviews/);
});
