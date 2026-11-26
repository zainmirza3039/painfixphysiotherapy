import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("homepage team section links directly to Dr Zain's named clinician profile", async () => {
  const source = await readFile(new URL("src/components/site/MeetDoctors.tsx", repo), "utf8");

  assert.match(source, /to="\/dr-zain-ul-abideen-pt-multan"/);
  assert.match(source, /Dr\. Zain Ul Abideen, DPT — Founder & Head Physiotherapist/);
  assert.match(source, /FOUNDER_PROFILE_SLUG/);
  assert.match(
    source,
    /sort\(\(a, b\) => Number\(b\.slug === FOUNDER_PROFILE_SLUG\) - Number\(a\.slug === FOUNDER_PROFILE_SLUG\)\)/,
  );
});
