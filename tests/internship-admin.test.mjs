import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const routes = [
  "src/routes/_authenticated/admin.internships.tsx",
  "src/routes/_authenticated/admin.internship-applications.tsx",
  "src/routes/_authenticated/admin.internship-participants.tsx",
  "src/routes/_authenticated/admin.experience-records.tsx",
  "src/routes/_authenticated/admin.certificates.tsx",
];

test("all internship admin routes use the existing AdminOnly guard", () => {
  for (const route of routes) {
    const source = read(route);
    assert.match(source, /AdminOnly/);
    assert.match(source, /InternshipAdminPage/);
    assert.match(source, /createFileRoute\("\/_authenticated\/admin\//);
  }
});

test("shared admin UI reads through the server function and invalidates its query", () => {
  const source = read("src/components/admin/internships/InternshipAdminPage.tsx");
  assert.match(source, /listInternshipAdminData/);
  assert.match(source, /useServerFn\(listInternshipAdminData\)/);
  assert.match(source, /invalidateQueries\(\{ queryKey: \["admin", "internships"\] \}\)/);
  assert.doesNotMatch(source, /supabase\s*\./);
});

test("admin workflow exposes private review notes, validated status choices, and certificate revocation", () => {
  const source = read("src/components/admin/internships/InternshipAdminPage.tsx");
  assert.match(source, /internal_notes/);
  assert.match(source, /applicationDecisionChoices\(application.status\)/);
  assert.match(source, /revokeCertificate/);
  assert.match(source, /Private reason for revocation/);
  assert.match(source, /downloadCertificatePdf/);
  assert.match(source, /previewCertificatePdf/);
});

test("forms distinguish internship engagement from employment", () => {
  const source = read("src/components/admin/internships/InternshipAdminPage.tsx");
  assert.match(source, /engagement_type: \"internship\"/);
  assert.match(source, /Professional Experience/);
  assert.match(source, /without treating interns as employees/);
});

test("strict admin converters omit server timestamps and normalize nullable UI values", () => {
  const source = read("src/admin/internship-form.ts");
  assert.match(source, /programInputSchema\.parse\(candidate\)/);
  assert.match(source, /participantInputSchema\.parse/);
  assert.match(source, /experienceInputSchema\.parse/);
  assert.match(source, /localDateTimeToIso/);
  assert.match(source, /created_at/);
  assert.match(source, /updated_at/);
  assert.match(source, /nullableText/);
});

test("admin UI includes all operational review and certificate safeguards", () => {
  const source = read("src/components/admin/internships/InternshipAdminPage.tsx");
  assert.match(source, /disableApplication/);
  assert.match(source, /completion_status === "completed"/);
  assert.match(source, /assessment_signed_off/);
  assert.match(source, /events[\s\S]*\.filter/);
  assert.match(source, /window\.confirm/);
  assert.match(source, /application\.full_name.*application\.reference/);
});
