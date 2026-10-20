import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  applicationSchema,
  applicationStatusSchema,
  certificateSchema,
  experienceSchema,
} from "../src/lib/internships.contract.ts";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261021000000_internship_certificates.sql"),
  "utf8",
);
const verifyRoute = fs.readFileSync(path.join(root, "src/routes/verify-certificate.tsx"), "utf8");

const validApplication = {
  program_slug: "runtime-internship",
  full_name: "Runtime Applicant",
  email: "runtime@example.test",
  phone: "+923001234567",
  city: "Lahore",
  educational_institution: "Test University",
  degree_program: "DPT",
  academic_status: "final year",
  clinical_exposure: "outpatient rotation",
  availability: "weekdays",
  motivation: "Runtime test",
  consent_privacy: true,
  internal_notes: null,
};

test("application schema executes the public input contract", () => {
  const parsed = applicationSchema.parse(validApplication);
  assert.equal(parsed.clinical_exposure, "outpatient rotation");
  for (const field of [
    "program_slug",
    "full_name",
    "email",
    "phone",
    "city",
    "educational_institution",
    "degree_program",
    "academic_status",
    "availability",
    "motivation",
    "consent_privacy",
  ])
    assert.ok(field in parsed, `required field ${field}`);
  for (const bad of [
    { ...validApplication, consent_privacy: false },
    { ...validApplication, email: "not-an-email" },
    { ...validApplication, phone: "not-a-phone" },
    { ...validApplication, program_slug: "Runtime Internship" },
  ])
    assert.throws(() => applicationSchema.parse(bad));
});

test("status and certificate/experience schemas reject unsafe states", () => {
  assert.deepEqual(applicationStatusSchema.options, [
    "submitted",
    "under_review",
    "shortlisted",
    "accepted",
    "rejected",
    "withdrawn",
    "completed",
  ]);
  assert.throws(() => applicationStatusSchema.parse("completed_without_acceptance"));
  assert.throws(() => certificateSchema.parse({ type: "internship", status: "issued" }));
  assert.throws(() =>
    experienceSchema.parse({
      full_name: "x",
      role: "x",
      engagement_type: "internship",
      responsibilities: "x",
      evidence_summary: "x",
      verified: true,
      approved: false,
    }),
  );
});

test("migration exposes the intended service-boundary RPCs and optional field", () => {
  assert.match(migration, /clinical_exposure\s+text/i);
  assert.match(
    migration,
    /CREATE(?: OR REPLACE)? FUNCTION public\.submit_internship_application\(p_payload jsonb/i,
  );
  for (const fn of [
    "public.submit_internship_application(jsonb,text)",
    "public.verify_internship_certificate(text,text)",
  ]) {
    const statements = migration.split(";");
    assert.ok(
      statements.some(
        (sql) =>
          sql.includes(fn) &&
          /REVOKE ALL ON FUNCTION/i.test(sql) &&
          /FROM PUBLIC,\s*anon,\s*authenticated/i.test(sql),
      ),
      `public execution revoked: ${fn}`,
    );
    assert.ok(
      statements.some(
        (sql) =>
          sql.includes(fn) &&
          /GRANT EXECUTE ON FUNCTION/i.test(sql) &&
          /TO service_role/i.test(sql),
      ),
      `service execution granted: ${fn}`,
    );
  }
  assert.match(migration, /certificates_active_source_idx[\s\S]*?WHERE status\s*=\s*'issued'/i);
});

test("verification route is canonical, uncached, and noindex", () => {
  assert.match(verifyRoute, /path:\s*["']\/verify-certificate["']/);
  assert.match(verifyRoute, /Cache-Control.*no-store/i);
  assert.match(verifyRoute, /X-Robots-Tag.*noindex/i);
  assert.match(verifyRoute, /Referrer-Policy.*no-referrer/i);
  assert.match(verifyRoute, /reference/);
});
