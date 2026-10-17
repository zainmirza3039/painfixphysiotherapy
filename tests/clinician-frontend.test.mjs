import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clinicianFormToInput,
  emptyClinicianForm,
  slugFromClinicianName,
} from "../src/admin/clinician-form.ts";

const repo = new URL("../", import.meta.url);

test("clinician form conversion trims fields and preserves contract array values by line", () => {
  const form = {
    ...emptyClinicianForm(),
    id: "b13b160c-52d8-4dc1-846c-6cdbdc07d449",
    slug: "  dr-example-pt  ",
    name: " Dr. Example ",
    full_name: " Dr. Example PT ",
    designation: " Clinical Physiotherapist ",
    professional_title: " Physiotherapist in Multan | DPT ",
    credentials: " DPT ",
    bio: "  Patient-centred care.  ",
    specialtiesText: "Manual Therapy\n\nSports Rehabilitation ",
    tagsText: "Back Pain\nNeck Pain",
    years_experience: "8",
    qualificationsText: "Doctor of Physical Therapy",
    phone_display: "0314-3039582",
    whatsapp_number: "+92 (314) 303-9582",
    introText: "First paragraph.\nSecond paragraph.",
    expertiseText: "Rehabilitation",
    conditions_treatedText: "Back pain",
    approachText: "Assess, plan, and review.",
    display_order: "12",
    is_active: true,
    is_published: false,
  };

  const payload = clinicianFormToInput(form, null);
  assert.equal(payload.id, form.id);
  assert.equal(payload.slug, "dr-example-pt");
  assert.equal(payload.name, "Dr. Example");
  assert.equal(payload.bio, "Patient-centred care.");
  assert.deepEqual(payload.specialties, ["Manual Therapy", "Sports Rehabilitation"]);
  assert.deepEqual(payload.intro, ["First paragraph.", "Second paragraph."]);
  assert.equal(payload.years_experience, 8);
  assert.equal(payload.whatsapp_number, "923143039582");
  assert.equal(payload.photo_path, null);
  assert.equal(payload.display_order, 12);
  assert.equal(payload.is_published, false);
});

test("blank optional profile values map to null or empty arrays, not invented content", () => {
  const payload = clinicianFormToInput(emptyClinicianForm(), null);
  assert.equal(payload.bio, null);
  assert.equal(payload.seo_bio, null);
  assert.equal(payload.phone_display, null);
  assert.equal(payload.whatsapp_number, null);
  assert.equal(payload.years_experience, null);
  assert.deepEqual(payload.qualifications, []);
  assert.deepEqual(payload.approach, []);
});

test("slug generation normalizes names to the contract's lowercase hyphen format", () => {
  assert.equal(slugFromClinicianName("Dr. Fatima Iqbal, DPT"), "dr-fatima-iqbal-dpt");
  assert.equal(slugFromClinicianName("Élodie—Physio"), "elodie-physio");
  assert.equal(slugFromClinicianName("   "), "");
});

test("admin route uses the dedicated admin API and separate public clinician workflow", async () => {
  const route = await readFile(
    new URL("src/routes/_authenticated/admin.clinicians.tsx", repo),
    "utf8",
  );
  const routeText = route.replace(/\s+/g, " ");
  assert.match(route, /<AdminOnly>/);
  assert.match(route, /listAdminClinicianProfiles/);
  assert.match(route, /saveAdminClinicianProfile/);
  assert.match(route, /removeAdminClinicianProfile/);
  assert.match(route, /createAdminClinicianPhotoUploadUrl/);
  assert.match(route, /uploadToSignedUrl/);
  assert.match(routeText, /separate staff login account are not deleted/);
  assert.doesNotMatch(route, /\.from\(["']profiles["']\)/);
  assert.doesNotMatch(route, /medical-reports/);
});

test("public search uses only active/published clinician API results, not static team records", async () => {
  const [index, dialog, page] = await Promise.all([
    readFile(new URL("src/lib/searchIndex.ts", repo), "utf8"),
    readFile(new URL("src/components/site/SiteSearch.tsx", repo), "utf8"),
    readFile(new URL("src/routes/search.tsx", repo), "utf8"),
  ]);
  assert.match(index, /listPublishedClinicianProfiles/);
  assert.match(index, /for \(const m of clinicians\)/);
  assert.doesNotMatch(index, /import\("@\/data\/team"\)/);
  assert.match(dialog, /Search is temporarily unavailable/);
  assert.match(dialog, /Try again/);
  assert.match(page, /Search is temporarily unavailable/);
  assert.match(page, /Try again/);
});

test("public clinician routes use published-profile lookups and do not fall back to static profiles", async () => {
  const [directory, detail] = await Promise.all([
    readFile(new URL("src/components/site/MeetDoctors.tsx", repo), "utf8"),
    readFile(new URL("src/routes/dr-zain-ul-abideen-pt-multan.tsx", repo), "utf8"),
  ]);
  assert.match(directory, /usePublishedClinicians/);
  assert.match(detail, /getPublishedClinicianProfileBySlug/);
  assert.doesNotMatch(detail, /getTeamMemberBySlug|mergeDoctor/);
});

test("sitemap does not cache incomplete clinician lists after a public API failure", async () => {
  const sitemap = await readFile(new URL("src/routes/sitemap[.]xml.ts", repo), "utf8");
  assert.match(sitemap, /Retry-After/);
  assert.match(sitemap, /status: 503/);
  assert.match(sitemap, /lastSuccessfulClinicianSlugs/);
  assert.match(sitemap, /usedStaleClinicianSlugs \? "no-store" : "public, max-age=300"/);
});
