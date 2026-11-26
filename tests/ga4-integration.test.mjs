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
  assert.ok(
    source.includes(
      "if (/^\\/(admin|patient|portal|sign-in|login)(\\/|$)/.test(pathname)) return;",
    ),
  );
  assert.match(source, /analyticsWindow\.gtag\?\.\("event", "page_view"/);
  assert.match(source, /page_location: window\.location\.origin \+ pathname/);
  assert.doesNotMatch(source, /page_location: window\.location\.href/);
});

test("GA4 records phone, WhatsApp, appointment CTA and lead-form events without form values", async () => {
  const source = await readFile(new URL("src/routes/__root.tsx", repo), "utf8");
  assert.match(source, /window\.gtag\("event", "generate_lead"/);
  assert.match(source, /lead_method: leadMethod/);
  assert.match(source, /appointment_details_ready/);
  assert.match(source, /appointment_cta_click/);
  assert.match(source, /href\.includes\("wa\.me"\)/);
  assert.match(source, /href\.includes\("api\.whatsapp\.com"\)/);
  assert.match(source, /transport_type: "beacon"/);
  assert.doesNotMatch(source, /form\.elements|FormData\(form\)|event\.target\.value/);
});

test("home-visit lead is recorded only after the request is successfully created", async () => {
  const source = await readFile(new URL("src/components/site/HomeVisitForm.tsx", repo), "utf8");
  const success = source.indexOf("toast.success(f.success)");
  const event = source.indexOf('analyticsWindow.gtag?.("event", "generate_lead"');
  assert.ok(success >= 0 && event > success);
  assert.match(source, /lead_method: "home_visit_form"/);
  assert.match(source, /lead_type: "home_visit"/);
  assert.doesNotMatch(source, /values\.full_name.*gtag|values\.phone.*gtag/);
});
