// Run after `npm run build`: node tests/clinician-public-smoke.mjs
// Both servers bind to loopback. All clinician/API data is synthetic.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const profile = (slug, extra = {}) => ({
  id: "b13b160c-52d8-4dc1-846c-6cdbdc07d449",
  slug,
  name: "Dr. Fixture",
  full_name: "Dr. Fixture Public PT",
  designation: "Fixture Physiotherapist",
  professional_title: "Fixture clinician title",
  credentials: "DPT",
  bio: "SYNTHETIC_BIOGRAPHY_VISIBLE_ON_PROFILE",
  seo_bio: null,
  specialties: ["Fixture rehabilitation"],
  tags: ["Fixture care"],
  years_experience: 0,
  qualifications: [],
  photo_path: null,
  photo_url: null,
  phone_display: null,
  whatsapp_number: null,
  meta_title: "Fixture clinician | PainFix",
  meta_description: "Synthetic clinician for local verification.",
  intro: [],
  expertise: [],
  conditions_treated: [],
  approach: [],
  is_active: true,
  is_published: true,
  display_order: 0,
  ...extra,
});
let fixtures = [
  profile("dr-fixture-pt"),
  profile("dr-zain-ul-abideen-pt-multan", {
    name: "Legacy fixture",
    full_name: "Legacy Fixture PT",
  }),
  profile("dr-fixture-draft", { full_name: "HIDDEN_DRAFT_FIXTURE", is_published: false }),
  profile("dr-fixture-inactive", { full_name: "HIDDEN_INACTIVE_FIXTURE", is_active: false }),
];
let outage = false;
const requests = [];
const api = createServer((request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");
  requests.push({ method: request.method, path: url.pathname, search: url.search });
  response.setHeader("Content-Type", "application/json");
  if (request.method !== "GET") {
    response.writeHead(405).end(JSON.stringify({ message: "Fixture server is read-only" }));
    return;
  }
  if (url.pathname === "/rest/v1/clinician_profiles") {
    if (outage) {
      response.writeHead(503).end(JSON.stringify({ message: "Synthetic API outage" }));
      return;
    }
    const rows = fixtures.filter((row) => {
      for (const field of ["slug", "is_active", "is_published"]) {
        const filter = url.searchParams.get(field);
        if (filter && filter !== `eq.${row[field]}`) return false;
      }
      return true;
    });
    response.end(JSON.stringify(rows));
    return;
  }
  response.end("[]");
});
api.listen(0, "127.0.0.1");
await once(api, "listening");
const apiUrl = `http://127.0.0.1:${api.address().port}`;
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const app = spawn(process.execPath, [".output/server/index.mjs"], {
  cwd: new URL("../", import.meta.url),
  env: {
    ...process.env,
    HOST: "127.0.0.1",
    PORT: String(port),
    SUPABASE_URL: apiUrl,
    SUPABASE_PUBLISHABLE_KEY: "synthetic-local-fixture-key",
    SUPABASE_SERVICE_ROLE_KEY: "synthetic-local-fixture-service-key",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let appOutput = "";
app.stdout.on("data", (chunk) => {
  appOutput += chunk;
});
app.stderr.on("data", (chunk) => {
  appOutput += chunk;
});
const get = async (path) => {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(10000) });
  return { response, html: await response.text() };
};
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (app.exitCode !== null) throw new Error(`Local app exited: ${appOutput}`);
    try {
      const response = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(500) });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* Wait for this local process to listen. */
    }
    await delay(100);
  }
  assert.ok(ready, `Local app did not become ready: ${appOutput}`);

  const directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assert.match(directory.html, /Dr\. Fixture Public PT/);
  assert.match(directory.html, /href="\/dr-fixture-pt"/);
  assert.doesNotMatch(directory.html, /HIDDEN_DRAFT_FIXTURE|HIDDEN_INACTIVE_FIXTURE/);
  console.log(
    "PASS: directory SSR contains published profiles and links, not drafts/inactive rows",
  );

  const detail = await get("/dr-fixture-pt");
  assert.equal(detail.response.status, 200);
  assert.match(detail.html, /SYNTHETIC_BIOGRAPHY_VISIBLE_ON_PROFILE/);
  assert.match(detail.html, /Fixture clinician \| PainFix/);
  assert.match(detail.html, /https:\/\/painfixphysiotherapy.com\/dr-fixture-pt/);
  assert.match(detail.html.replace(/<!--.*?-->/g, ""), /0 years/);
  console.log(
    "PASS: dynamic profile SSR reflects saved biography, SEO, canonical and zero experience",
  );

  const legacy = await get("/dr-zain-ul-abideen-pt-multan");
  assert.equal(legacy.response.status, 200);
  assert.match(legacy.html, /Legacy Fixture PT/);
  console.log("PASS: legacy clinician route reads the same published API contract");

  for (const slug of ["dr-fixture-draft", "dr-fixture-inactive", "dr-fixture-missing"]) {
    const missing = await get(`/${slug}`);
    assert.equal(missing.response.status, 404, slug);
    assert.match(missing.html, /Clinician profile not found/);
    assert.doesNotMatch(missing.html, /HIDDEN_DRAFT_FIXTURE|HIDDEN_INACTIVE_FIXTURE/);
  }
  console.log("PASS: draft, inactive and unknown profiles return 404 without static fallback");

  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.response.status, 200);
  assert.match(sitemap.html, /\/dr-fixture-pt<\/loc>/);
  assert.doesNotMatch(sitemap.html, /dr-fixture-draft|dr-fixture-inactive/);
  fixtures = fixtures.map((row) => ({ ...row, is_published: false }));
  const unpublished = await get("/dr-fixture-pt");
  assert.equal(unpublished.response.status, 404);
  const emptyDirectory = await get("/our-team");
  assert.equal(emptyDirectory.response.status, 200);
  assert.match(emptyDirectory.html, /No clinician profiles are currently published/);
  console.log("PASS: unpublication removes profile and SSR directory content on a new request");

  outage = true;
  const unavailable = await get("/sitemap.xml");
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.response.headers.get("cache-control"), "no-store");
  assert.equal(unavailable.response.headers.get("retry-after"), "60");
  assert.doesNotMatch(unavailable.html, /dr-fixture-pt/);
  console.log(
    "PASS: sitemap outage fails closed after prior success, without stale clinician URLs",
  );
  assert.ok(requests.length > 0);
  assert.ok(requests.every((request) => request.method === "GET"));
  console.log(
    `PASS: ${requests.length} fixture API requests were read-only; no production API used`,
  );
} catch (error) {
  console.error(appOutput.slice(-6000));
  throw error;
} finally {
  app.kill("SIGTERM");
  await once(app, "exit");
  await new Promise((resolve) => api.close(resolve));
}
