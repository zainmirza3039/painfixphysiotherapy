import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const repo = new URL("../", import.meta.url);

test("GA4 loads only on the canonical PainFix production host", async () => {
  const source = await readFile(new URL("src/routes/__root.tsx", repo), "utf8");
  assert.match(source, /const GA4_MEASUREMENT_ID = "G-91JS1V1T9E"/);
  assert.match(source, /host !== \$\{JSON\.stringify\(CLARITY_HOST\)\}/);
  assert.match(source, /googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(source, /send_page_view: false/);
});

test("GA4 excludes private routes and sends query-free SPA page views", async () => {
  const source = await readFile(new URL("src/routes/__root.tsx", repo), "utf8");
  assert.match(source, /\(admin\|patient\|portal\|sign-in\|login\)/);
  assert.match(source, /analyticsWindow\.gtag\?\.\("event", "page_view"/);
  assert.match(source, /page_location: window\.location\.origin \+ pathname/);
  assert.doesNotMatch(source, /page_location: window\.location\.href/);
});
