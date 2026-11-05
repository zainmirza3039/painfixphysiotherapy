import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { applicationFormToPayload } from "../src/lib/internship-application-form.ts";
import { OPENING_HOURS } from "../src/components/site/constants.ts";

const dataModule = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const boundary = dataModule(
  "export const verifyCertificate = async () => { throw new Error('Network is not used in render tests'); }; export const submitInternshipApplication = verifyCertificate;",
);
const contractUrl = new URL("../src/lib/internships.contract.ts", import.meta.url).href;
async function componentUrl(file, overrides = {}) {
  const source = await readFile(
    new URL(`../src/components/internships/${file}`, import.meta.url),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const imports = {
    "@/lib/internships.functions": boundary,
    "@/lib/internships.contract": contractUrl,
    "@/lib/internship-application-form": new URL(
      "../src/lib/internship-application-form.ts",
      import.meta.url,
    ).href,
    ...overrides,
  };
  return dataModule(
    outputText.replace(
      /from\s+(["'])([^"']+)\1/g,
      (_, quote, specifier) =>
        `from ${JSON.stringify(imports[specifier] ?? import.meta.resolve(specifier))}`,
    ),
  );
}
const applicationUrl = await componentUrl("ApplicationForm.tsx");
const { ApplicationForm, ApplicationConfirmation } = await import(applicationUrl);
const { CertificateVerification } = await import(await componentUrl("CertificateVerification.tsx"));
const { ProgramDetail } = await import(
  await componentUrl("ProgramDetail.tsx", { "./ApplicationForm": applicationUrl })
);
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));
const program = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "render-test-only",
  title: "Test fixture only",
  description: "Synthetic test fixture, never published.",
  discipline: "Physiotherapy",
  duration: "Test duration",
  delivery_mode: "on_site",
  eligibility: "Test eligibility",
  objectives: ["Test objective"],
  requirements: ["Test requirement"],
  location: null,
  schedule: null,
  seats: null,
  fees: null,
  application_open_at: null,
  application_close_at: null,
  applications_open: true,
  status: "published",
  required_documents: ["Test document"],
  selection_criteria: "Test selection",
  supervisor: null,
  completion_criteria: "Test sign-off",
  minimum_attendance: 80,
  faqs: [],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

test("real program details render published, closed and read-only draft states", () => {
  const open = render(ProgramDetail, { program });
  assert.match(open, /Apply for this program/);
  assert.match(open, /Required documents/);
  assert.match(open, /Minimum attendance/);
  assert.match(open, /Not yet confirmed/);
  const supervised = render(ProgramDetail, {
    program: { ...program, supervisor: "Dr. Zain Ul Abideen, PT" },
  });
  assert.ok(supervised.includes("Dr. Zain Ul Abideen, PT"));
  const closed = render(ProgramDetail, { program: { ...program, applications_open: false } });
  assert.match(closed, /Applications are closed/);
  assert.doesNotMatch(closed, /<form/);
  const draft = render(ProgramDetail, {
    program: { ...program, status: "draft" },
    disableApplication: true,
  });
  assert.match(draft, /Draft preview/);
  assert.doesNotMatch(draft, /<form/);
});
test("real application form has named labels, privacy notice and unticked consent", () => {
  const html = render(ApplicationForm, { program });
  for (const field of [
    "full_name",
    "email",
    "phone",
    "city",
    "educational_institution",
    "degree_program",
    "academic_status",
    "availability",
    "motivation",
  ]) {
    assert.ok(html.includes(`for="application-${field}"`));
    assert.ok(html.includes(`id="application-${field}"`));
  }
  assert.match(html, /Documents are not uploaded here/);
  assert.doesNotMatch(html, /type="checkbox"[^>]*checked/);
  assert.match(html, /Submit application/);
});
test("application form normalizer produces the exact server contract and respects consent", () => {
  const values = {
    full_name: " Test Applicant ",
    email: "qa@example.test",
    phone: "+923001234567",
    city: "Test City",
    educational_institution: "Test Institution",
    degree_program: "DPT",
    academic_status: "Final year",
    availability: "Weekdays",
    motivation: "Test only",
    consent_privacy: "true",
    status: "accepted",
    program_id: "injected",
    privacy_consent: "injected",
  };
  const payload = applicationFormToPayload(program.slug, values);
  assert.equal(payload.full_name, "Test Applicant");
  assert.equal(payload.clinical_exposure, null);
  assert.equal(payload.program_slug, program.slug);
  assert.equal(payload.consent_privacy, true);
  for (const field of ["status", "program_id", "privacy_consent"])
    assert.equal(field in payload, false);
  assert.throws(() =>
    applicationFormToPayload(program.slug, { ...values, consent_privacy: "false" }),
  );
  assert.throws(() => applicationFormToPayload(program.slug, { ...values, email: "invalid" }));
});
test("real application confirmation shows only a reference and no acceptance claim", () => {
  const html = render(ApplicationConfirmation, { reference: "TEST-REFERENCE-NOT-A-CREDENTIAL" });
  assert.match(html, /Application received/);
  assert.match(html, /TEST-REFERENCE-NOT-A-CREDENTIAL/);
  assert.match(html, /does not guarantee selection/);
});
for (const [status, expected] of [
  ["valid", "Valid certificate"],
  ["revoked", "Certificate revoked"],
  ["not_found", "Certificate not found"],
  ["unavailable", "Verification unavailable"],
]) {
  test(`real verifier renders ${status} without private data`, () => {
    const certificate = {
      reference: "TEST-REFERENCE",
      type: "internship",
      recipient_name: "Test A.",
      program_or_role: "Test program",
      issue_date: "2026-01-01",
      start_date: "2025-01-01",
      end_date: "2025-02-01",
      issuing_organization: "PainFix Physiotherapy Clinic",
      email: "private-marker@example.test",
      internal_notes: "private-marker-notes",
    };
    const html = render(CertificateVerification, {
      initialReference: "TEST-REFERENCE",
      initialResult: { status, ...(["valid", "revoked"].includes(status) ? { certificate } : {}) },
    });
    assert.ok(html.includes(expected));
    assert.doesNotMatch(html, /private-marker/);
    if (status === "revoked") assert.match(html, /not currently valid/);
  });
}

test("site-wide clinic hours remain consistent", () => {
  assert.deepEqual(OPENING_HOURS, [
    { days: "Monday – Saturday", time: "11:00 AM – 4:00 PM" },
    { days: "Sunday", time: "By Appointment" },
  ]);
});

test("local business SEO stay aligned with the verified business profile", async () => {
  const [constants, localPages, root, localSeo, hero, llms] = await Promise.all([
    readFile(new URL("../src/components/site/constants.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/data/localPages.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/routes/__root.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/local-seo.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/components/site/Hero.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
  ]);
  assert.match(constants, /time: "11:00 AM – 4:00 PM"/);
  assert.match(localPages, /11:00 AM to 4:00 PM/);
  assert.match(localPages, /Sunday is available by appointment only/);
  assert.doesNotMatch(localPages, /11:00 AM.{0,20}9:00 PM/);
  assert.doesNotMatch(localPages, /31 reviews/);
  assert.doesNotMatch(root, /aggregateRating|reviewCount/);
  assert.match(root, /closes: "16:00"/);
  assert.match(localSeo, /closes: "16:00"/);
  assert.match(hero, /Mon–Sat, 11:00 AM–4:00 PM/);
  assert.match(llms, /11:00 AM–4:00 PM/);
  assert.match(llms, /Sunday by appointment/);
  assert.doesNotMatch(llms, /11:00 AM–9:00 PM/);
});
