import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("local landing pages show verifiable clinic and review evidence", async () => {
  const [page, constants] = await Promise.all([
    readFile(new URL("src/components/site/LocalLandingPage.tsx", repo), "utf8"),
    readFile(new URL("src/components/site/constants.ts", repo), "utf8"),
  ]);

  assert.ok(page.includes("@/assets/clinic-exterior.webp"));
  assert.ok(page.includes("PainFix Physiotherapy Clinic storefront in Shalimar Colony, Multan"));
  assert.ok(page.includes("GOOGLE_BUSINESS_PROFILE_URL"));
  assert.ok(page.includes("GOOGLE_REVIEW_URL"));
  assert.ok(page.includes("CLINIC_ADDRESS"));
  assert.ok(page.includes("OPENING_HOURS.map"));
  assert.ok(constants.includes("export const GOOGLE_BUSINESS_PROFILE_URL"));
  assert.ok(constants.includes("export const GOOGLE_REVIEW_URL"));

  // Keep review data evergreen; Google remains the source of the live rating/count.
  assert.doesNotMatch(page, /4\.9★|31 reviews|44 reviews/);
});
