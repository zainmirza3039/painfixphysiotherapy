import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clinicianFormToInput,
  clinicianProfileToForm,
  emptyClinicianForm,
  slugFromClinicianName,
} from "../src/admin/clinician-form.ts";
import { toClinicianView } from "../src/lib/clinician-view.ts";
import { clinicianProfileInputSchema } from "../src/admin/clinician-profile.contract.ts";

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

test("public clinician fallback is isolated from admin CRUD and uses only existing static records", async () => {
  const [directory, detail, boundary, admin] = await Promise.all([
    readFile(new URL("src/components/site/MeetDoctors.tsx", repo), "utf8"),
    readFile(new URL("src/routes/dr-zain-ul-abideen-pt-multan.tsx", repo), "utf8"),
    readFile(new URL("src/lib/public-clinicians.ts", repo), "utf8"),
    readFile(new URL("src/routes/_authenticated/admin.clinicians.tsx", repo), "utf8"),
  ]);
  assert.match(directory, /usePublishedClinicians/);
  assert.match(detail, /getPublicClinicianBySlug/);
  assert.match(boundary, /listPublishedClinicianProfiles/);
  assert.match(boundary, /getPublishedClinicianProfileBySlug/);
  assert.match(boundary, /\(\) => team/);
  assert.match(boundary, /getTeamMemberBySlug\(slug\) \?\? null/);
  assert.doesNotMatch(admin, /withPublicClinicianFallback|public-clinicians/);
  assert.match(admin, /profilesQuery\.isError/);
  assert.doesNotMatch(detail, /getTeamMemberBySlug|mergeDoctor/);
});

test("sitemap does not cache incomplete clinician lists after a public API failure", async () => {
  const sitemap = await readFile(new URL("src/routes/sitemap[.]xml.ts", repo), "utf8");
  assert.match(sitemap, /Retry-After/);
  assert.match(sitemap, /status: 503/);
  assert.match(sitemap, /"Cache-Control": "no-store"/);
  assert.doesNotMatch(sitemap, /lastSuccessfulClinicianSlugs|usedStaleClinicianSlugs/);
});

const sampleProfile = () => ({
  ...clinicianFormToInput(
    {
      ...emptyClinicianForm(),
      slug: "dr-example-pt",
      name: "Dr. Example",
      full_name: "Dr. Example PT",
      designation: "Physiotherapist",
      professional_title: "Clinical Physiotherapist",
      bio: "A biography managed in the dashboard.",
    },
    null,
  ),
  id: "b13b160c-52d8-4dc1-846c-6cdbdc07d449",
  photo_url: null,
  resolved_photo_url: null,
  created_at: "2026-10-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
});

test("admin profile round-trip preserves editable values and excludes storage/auth metadata", () => {
  const profile = {
    ...sampleProfile(),
    specialties: ["Sports rehabilitation", "Manual therapy"],
    years_experience: 0,
    is_active: false,
    is_published: false,
    display_order: 30,
  };
  const payload = clinicianFormToInput(clinicianProfileToForm(profile), profile.photo_path);
  assert.equal(clinicianProfileInputSchema.safeParse(payload).success, true);
  assert.deepEqual(payload.specialties, profile.specialties);
  assert.equal(payload.years_experience, 0);
  assert.equal(payload.is_active, false);
  assert.equal(payload.is_published, false);
  assert.equal(payload.display_order, 30);
  assert.equal("photo_url" in payload, false);
  assert.equal("resolved_photo_url" in payload, false);
  assert.equal("created_at" in payload, false);
});

test("public view uses the saved biography when optional introduction paragraphs are absent", () => {
  const profile = sampleProfile();
  assert.deepEqual(toClinicianView(profile).profile.intro, [profile.bio]);
  assert.deepEqual(toClinicianView({ ...profile, intro: ["Custom introduction."] }).profile.intro, [
    "Custom introduction.",
  ]);
  assert.deepEqual(toClinicianView({ ...profile, bio: null }).profile.intro, []);
});

test("public view preserves missing optional data without restoring static clinician details", () => {
  const profile = { ...sampleProfile(), bio: null };
  const view = toClinicianView(profile);
  assert.equal(view.photo, null);
  assert.equal(view.phoneDisplay, "");
  assert.equal(view.whatsapp, "");
  assert.equal(view.yearsExperience, null);
  assert.deepEqual(view.profile.qualifications, []);
  assert.deepEqual(view.profile.approach, []);
});

test("public and admin portraits resolve from their respective contract response fields", () => {
  const profile = sampleProfile();
  const admin = { ...profile, resolved_photo_url: "https://example.invalid/admin.webp" };
  assert.equal(toClinicianView(admin).photo, admin.resolved_photo_url);
  const { resolved_photo_url: _resolved, ...publicProfile } = profile;
  publicProfile.photo_url = "https://example.invalid/public.webp";
  assert.equal(toClinicianView(publicProfile).photo, publicProfile.photo_url);
});

test("team directory seeds SSR cards from the current published-profile loader", async () => {
  const [route, directory, query] = await Promise.all([
    readFile(new URL("src/routes/our-team.tsx", repo), "utf8"),
    readFile(new URL("src/components/site/MeetDoctors.tsx", repo), "utf8"),
    readFile(new URL("src/lib/usePublishedClinicians.ts", repo), "utf8"),
  ]);
  assert.match(route, /loader: \(\) => listPublicClinicians\(\)/);
  assert.match(route, /initialProfiles=\{profiles\}/);
  assert.match(directory, /usePublishedClinicians\(initialProfiles\)/);
  assert.match(query, /initialData: initialProfiles/);
  assert.match(query, /queryFn: \(\) => listPublicClinicians\(\)/);
});

test("admin save locks edits and rejects concurrent profile/photo actions until settlement", async () => {
  const route = await readFile(
    new URL("src/routes/_authenticated/admin.clinicians.tsx", repo),
    "utf8",
  );
  assert.match(route, /const operationRef = useRef\(false\)/);
  assert.match(route, /if \(operationRef.current\) return false/);
  assert.match(route, /<fieldset disabled=\{isBusy\}/);
  assert.equal((route.match(/onSettled: endOperation/g) ?? []).length, 5);
  assert.match(route, /if \(!beginOperation\(\)\) return;\s+saveMutation.mutate/);
  assert.match(route, /clearPhotoTarget && beginOperation\(\)/);
  assert.match(route, /photoCleanup && beginOperation\(\)/);
});

test("admin photo selection resets the native input and save errors remain visible inline", async () => {
  const route = await readFile(
    new URL("src/routes/_authenticated/admin.clinicians.tsx", repo),
    "utf8",
  );
  assert.match(route, /event.currentTarget.value = ""/);
  assert.match(route, /onError: \(error\) => \{\s+setFormError\(errorMessage\(error\)\)/);
  assert.match(route, /formErrorRef.current\?\.focus\(\)/);
  assert.match(route, /queryKey: \["public-clinician-profiles"\]/);
  assert.match(route, /router.invalidate\(\)/);
});

test("deactivation confirmation validates and preserves the edited profile before saving", async () => {
  const route = await readFile(
    new URL("src/routes/_authenticated/admin.clinicians.tsx", repo),
    "utf8",
  );
  const validation = route.indexOf("const parsed = clinicianProfileInputSchema.safeParse(payload)");
  const confirmation = route.indexOf("if (deactivating && !confirmedDeactivation)");
  assert.ok(validation > 0 && validation < confirmation);
  assert.match(route, /deactivating \? \{ \.\.\.form, is_published: false \} : form/);
  assert.match(route, /submitForm\(event, true\)/);
});
