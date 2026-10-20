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
  service_mode: "clinic",
  city: "Multan",
  experience: [],
  training: [],
  research: [],
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
    expertise: ["Fixture clinical practice"],
  }),
  profile("ariba-babar", {
    name: "Ariba Babar",
    full_name: "ARIBA BABAR, DPT",
    service_mode: "online_only",
    city: "Rahim Yar Khan, Pakistan",
    phone_display: "+92 312 0102560",
    whatsapp_number: "923120102560",
    years_experience: null,
    specialties: [],
    expertise: ["Assessment, rehabilitation planning and patient education"],
    conditions_treated: ["Synthetic online-care condition"],
    experience: ["Supervised hospital internship"],
    training: ["Dry needling training"],
    research: ["Observational cross-sectional study"],
    meta_title: "Ariba Babar DPT — Online Physiotherapy in Rahim Yar Khan | PainFix",
    meta_description:
      "Online physiotherapy enquiries with Ariba Babar, DPT, based in Rahim Yar Khan, Pakistan.",
  }),
  profile("dr-fixture-draft", { full_name: "HIDDEN_DRAFT_FIXTURE", is_published: false }),
  profile("dr-fixture-inactive", { full_name: "HIDDEN_INACTIVE_FIXTURE", is_active: false }),
];
let apiMode = "normal";
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
    if (apiMode === "missing-table") {
      response.writeHead(404).end(
        JSON.stringify({
          code: "PGRST205",
          message: "Could not find the table public.clinician_profiles",
        }),
      );
      return;
    }
    if (apiMode === "outage") {
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
const appEnvKeys = [
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_SERVICE_ROLE_KEY",
  "PUBLIC_SUPABASE_URL",
  "PUBLIC_SUPABASE_PUBLISHABLE_KEY",
];
let app;
let appOutput = "";
const startApp = async ({ configured = true } = {}) => {
  const env = { ...process.env, HOST: "127.0.0.1", PORT: String(port) };
  for (const key of appEnvKeys) delete env[key];
  if (configured) {
    env.SUPABASE_URL = apiUrl;
    env.SUPABASE_PUBLISHABLE_KEY = "synthetic-local-fixture-key";
    env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-local-fixture-service-key";
  }
  appOutput = "";
  app = spawn(process.execPath, [".output/server/index.mjs"], {
    cwd: new URL("../", import.meta.url),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  app.stdout.on("data", (chunk) => {
    appOutput += chunk;
  });
  app.stderr.on("data", (chunk) => {
    appOutput += chunk;
  });
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
};
const stopApp = async () => {
  if (!app || app.exitCode !== null) return;
  app.kill("SIGTERM");
  await once(app, "exit");
};
const get = async (path) => {
  const response = await fetch(`${origin}${path}`, { signal: AbortSignal.timeout(10000) });
  return { response, html: await response.text() };
};
const staticMembers = [
  ["Dr. Zain Ul Abideen PT", "dr-zain-ul-abideen-pt-multan"],
  ["Dr. Jalal Ud Din PT", "dr-jalal-ud-din-pt-multan"],
  ["Dr. Fatima Iqbal PT", "dr-fatima-iqbal-dpt-multan"],
];
const assertStaticDirectory = (html) => {
  for (const [name, slug] of staticMembers) {
    assert.match(html, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(html, new RegExp(`href=\\"/${slug}\\"`));
  }
  assert.equal((html.match(/<article class="home-team-row">/g) ?? []).length, 3);
  assert.doesNotMatch(html, /Fixture Public PT|Legacy Fixture PT|HIDDEN_DRAFT_FIXTURE/);
};
const assertStaticProfile = (html, name, slug) => {
  assert.match(html, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, new RegExp(`https://painfixphysiotherapy.com/${slug}`));
  assert.match(
    html,
    new RegExp(
      `<title>${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(" PT", " (?:PT|DPT)")}[^<]*</title>`,
    ),
  );
};

const headerHtml = (html) => html.split("<main>")[0];
const floatingHtml = (html) =>
  html.match(/<div class="fab-safe-area[^\"]*">([\s\S]*?)<\/div>/)?.[1];
const whatsappLinks = (html) =>
  [...html.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(
    (match) => new URL(match[1].replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'")),
  );
const assertDefaultSharedBooking = (html) => {
  const header = headerHtml(html);
  const floating = floatingHtml(html);
  assert.ok(floating);
  assert.match(header, /href="\/book-appointment"/);
  assert.match(header, /href="\/home-visit"/);
  const links = whatsappLinks(header);
  assert.equal(links.length, 2, "desktop and mobile retain their default WhatsApp CTA");
  for (const link of [...links, ...whatsappLinks(floating)]) {
    assert.equal(link.pathname, "/923143039582");
    assert.equal(
      link.searchParams.get("text"),
      "Hi PainFix Physiotherapy, I'd like a consultation. Can you help me with my condition?",
    );
  }
  assert.match(floating, /href="tel:\+923143039582"/);
};

try {
  await startApp();
  let directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assert.match(directory.html, /Dr\. Fixture Public PT/);
  assert.match(directory.html, /href="\/dr-fixture-pt"/);
  assert.doesNotMatch(directory.html, /HIDDEN_DRAFT_FIXTURE|HIDDEN_INACTIVE_FIXTURE/);
  console.log(
    "PASS: normal directory SSR contains published managed profiles, not drafts/inactive rows",
  );

  const detail = await get("/dr-fixture-pt");
  assert.equal(detail.response.status, 200);
  assert.match(detail.html, /SYNTHETIC_BIOGRAPHY_VISIBLE_ON_PROFILE/);
  assert.match(detail.html, /Fixture clinician \| PainFix/);
  assert.match(detail.html, /https:\/\/painfixphysiotherapy.com\/dr-fixture-pt/);
  assert.match(detail.html.replace(/<!--.*?-->/g, ""), /0 years/);
  console.log(
    "PASS: normal dynamic profile SSR reflects managed biography, SEO, canonical and zero experience",
  );

  const legacy = await get("/dr-zain-ul-abideen-pt-multan");
  assert.equal(legacy.response.status, 200);
  assert.match(legacy.html, /Legacy Fixture PT/);
  assert.match(legacy.html, /Areas of Expertise/);
  assert.doesNotMatch(legacy.html, /Clinical Skills|not independent specialist qualifications/);
  assertDefaultSharedBooking(legacy.html);
  assertDefaultSharedBooking(directory.html);
  console.log("PASS: normal legacy route reads the managed API contract");

  const online = await get("/ariba-babar");
  assert.equal(online.response.status, 200);
  const onlineHeader = headerHtml(online.html);
  const onlineFloating = floatingHtml(online.html);
  assert.ok(onlineFloating, "online profiles retain a contextual floating WhatsApp CTA");
  assert.doesNotMatch(
    onlineHeader,
    /href="\/(?:book-appointment|home-visit)"|href="https:\/\/calendly\.com|Home Visits|Home Physiotherapy/,
  );
  assert.doesNotMatch(onlineFloating, /href="tel:|923143039582|clinic/i);
  assert.match(onlineHeader, /Online Physiotherapy Enquiry/);
  const sharedOnlineLinks = [...whatsappLinks(onlineHeader), ...whatsappLinks(onlineFloating)];
  assert.equal(sharedOnlineLinks.length, 3, "desktop header, mobile header, and floating CTA");
  for (const link of sharedOnlineLinks) {
    assert.equal(link.pathname, "/923120102560");
    assert.match(
      link.searchParams.get("text"),
      /online physiotherapy consultation with Ariba Babar/,
    );
    assert.doesNotMatch(link.searchParams.get("text"), /clinic|home visits|Multan/i);
  }
  console.log(
    "PASS: online desktop/mobile header and floating CTAs contact Ariba directly; clinic and directory defaults are unchanged",
  );
  const onlineMain = online.html.match(/<main>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(onlineMain);
  assert.match(onlineMain, /Online physiotherapy · Rahim Yar Khan, Pakistan/);
  assert.match(onlineMain, />AB<\/span>/);
  assert.match(onlineMain, /Clinical Skills/);
  assert.doesNotMatch(onlineMain, /Areas of Expertise/);
  assert.match(onlineMain, /Assessment, rehabilitation planning and patient education/);
  assert.match(
    onlineMain,
    /supervised clinical exposure, not independent specialist qualifications/,
  );
  assert.match(onlineMain, /Clinical Experience/);
  assert.match(onlineMain, /Supervised hospital internship/);
  assert.match(onlineMain, /Dry needling training/);
  assert.match(onlineMain, /Observational cross-sectional study/);
  assert.doesNotMatch(
    onlineMain,
    /Multan|Clinic Information|Usman Raja|Opening Hours|maps\.google/,
  );
  const onlineLinks = [...onlineMain.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(onlineLinks.length, 2);
  for (const link of onlineLinks) {
    const url = new URL(link.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'"));
    assert.equal(url.pathname, "/923120102560");
    assert.match(
      url.searchParams.get("text"),
      /online physiotherapy consultation with Ariba Babar/,
    );
  }
  assert.match(
    online.html,
    /rel="canonical"[^>]+href="https:\/\/painfixphysiotherapy.com\/ariba-babar"/,
  );
  const onlineSchemas = [
    ...online.html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ].map((match) => JSON.parse(match[1]));
  const person = onlineSchemas.find((schema) => schema.name === "ARIBA BABAR, DPT");
  assert.ok(person);
  assert.equal(person["@type"], "Person");
  assert.equal(person.address, undefined);
  assert.equal(person.areaServed, undefined);
  assert.equal(person.homeLocation.name, "Rahim Yar Khan, Pakistan");
  assert.equal(person.telephone, "+923120102560");
  assert.match(directory.html, /href="\/ariba-babar"/);
  assert.match(directory.html, /Online physiotherapy · Rahim Yar Khan, Pakistan/);
  console.log(
    "PASS: online-only profile has AB placeholder, CV sections, direct WhatsApp, canonical and address-free Person metadata; clinic content is excluded",
  );

  for (const slug of ["dr-fixture-draft", "dr-fixture-inactive", "dr-fixture-missing"]) {
    const missing = await get(`/${slug}`);
    assert.equal(missing.response.status, 404, slug);
    assert.match(missing.html, /Clinician profile not found/);
    assert.doesNotMatch(missing.html, /HIDDEN_DRAFT_FIXTURE|HIDDEN_INACTIVE_FIXTURE/);
  }
  console.log("PASS: draft, inactive and unknown managed profiles return 404");

  apiMode = "missing-table";
  directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assertStaticDirectory(directory.html);
  for (const [name, slug] of staticMembers) {
    const page = await get(`/${slug}`);
    assert.equal(page.response.status, 200, slug);
    assertStaticProfile(page.html, name, slug);
  }
  const unknownDuringTableOutage = await get("/dr-fixture-missing");
  assert.equal(unknownDuringTableOutage.response.status, 404);
  assert.match(unknownDuringTableOutage.html, /Clinician profile not found/);
  console.log(
    "PASS: PGRST205 missing-table fallback shows exactly the three static clinicians and keeps unknown slugs 404",
  );

  apiMode = "outage";
  directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assertStaticDirectory(directory.html);
  const unknownDuringOutage = await get("/dr-never-published");
  assert.equal(unknownDuringOutage.response.status, 404);
  console.log(
    "PASS: generic API outage uses the same public-only static fallback without inventing unknown profiles",
  );

  apiMode = "normal";
  const recovered = await get("/dr-fixture-pt");
  assert.equal(recovered.response.status, 200);
  assert.match(recovered.html, /SYNTHETIC_BIOGRAPHY_VISIBLE_ON_PROFILE/);
  assert.doesNotMatch(recovered.html, /Dr\. Zain Ul Abideen PT/);
  console.log(
    "PASS: managed API recovery restores fixture data instead of retaining static fallback",
  );

  const sitemap = await get("/sitemap.xml");
  assert.equal(sitemap.response.status, 200);
  assert.match(sitemap.html, /\/dr-fixture-pt<\/loc>/);
  assert.match(sitemap.html, /\/ariba-babar<\/loc>/);
  assert.doesNotMatch(sitemap.html, /dr-fixture-draft|dr-fixture-inactive/);

  fixtures = fixtures.map((row) => ({ ...row, is_published: false }));
  const unpublished = await get("/dr-fixture-pt");
  assert.equal(unpublished.response.status, 404);
  assert.equal((await get("/ariba-babar")).response.status, 404);
  directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assert.match(directory.html, /No clinician profiles are currently published/);
  assert.doesNotMatch(
    directory.html,
    /Dr\. Zain Ul Abideen PT|Dr\. Jalal Ud Din PT|Dr\. Fatima Iqbal PT/,
  );
  console.log(
    "PASS: successful empty roster honors unpublication and never falls back to static records",
  );

  const unpublishedStatic = await get("/dr-zain-ul-abideen-pt-multan");
  assert.equal(unpublishedStatic.response.status, 404);
  assert.doesNotMatch(unpublishedStatic.html, /Dr\. Zain Ul Abideen PT/);
  apiMode = "outage";
  const unavailableSitemap = await get("/sitemap.xml");
  assert.equal(unavailableSitemap.response.status, 503);
  assert.equal(unavailableSitemap.response.headers.get("cache-control"), "no-store");
  assert.equal(unavailableSitemap.response.headers.get("retry-after"), "60");
  assert.doesNotMatch(unavailableSitemap.html, /dr-fixture-pt/);
  console.log("PASS: sitemap outages still fail closed without static or stale clinician URLs");

  await stopApp();
  apiMode = "outage";
  const requestsBeforeMissingConfig = requests.length;
  await startApp({ configured: false });
  directory = await get("/our-team");
  assert.equal(directory.response.status, 200);
  assertStaticDirectory(directory.html);
  for (const [name, slug] of staticMembers) {
    const page = await get(`/${slug}`);
    assert.equal(page.response.status, 200, slug);
    assertStaticProfile(page.html, name, slug);
  }
  const fatima = await get("/dr-fatima-iqbal-dpt-multan");
  assert.doesNotMatch(
    fatima.html,
    /<img[^>]+dr-(?:zain|jalal)|years? of experience|[0-9]+ years?/i,
  );
  assert.equal(requests.length, requestsBeforeMissingConfig);
  console.log(
    "PASS: missing public Supabase URL/key in a separate child process serves static pages without any API request; Fatima has no portrait/experience claim",
  );

  assert.ok(requests.length > 0);
  assert.ok(requests.every((request) => request.method === "GET"));
  console.log(
    `PASS: ${requests.length} synthetic API requests were read-only; no production API used`,
  );
} catch (error) {
  console.error(appOutput.slice(-6000));
  throw error;
} finally {
  await stopApp();
  await new Promise((resolve) => api.close(resolve));
}
