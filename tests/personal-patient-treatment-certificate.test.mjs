import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261127010000_personal_patient_treatment_documents.sql",
  "utf8",
);
const component = readFileSync("src/components/admin/PatientTreatmentCertificate.tsx", "utf8");
const pdf = readFileSync("src/lib/treatment-certificate-pdf.ts", "utf8");
const route = readFileSync("src/routes/verify-certificate.tsx", "utf8");
const detail = readFileSync(
  "src/routes/_authenticated/admin.personal-patients.$patientId.tsx",
  "utf8",
);
const verifyFunction = readFileSync(
  "supabase/functions/verify-treatment-document/index.ts",
  "utf8",
);
const issueFunction = readFileSync("supabase/functions/issue-treatment-document/index.ts", "utf8");

test("certificate snapshots are owner-scoped, immutable and revocable", () => {
  assert.match(migration, /verification_token_hash text not null unique/);
  assert.match(migration, /snapshot jsonb not null/);
  assert.match(migration, /Clinicians read their own treatment documents/);
  assert.match(migration, /Clinicians revoke their own treatment documents/);
  assert.match(migration, /Issued treatment document snapshots are immutable/);
});

test("public QR verification exposes only masked allow-listed fields", () => {
  assert.match(verifyFunction, /completed_sessions/);
  assert.doesNotMatch(verifyFunction, /diagnosis/);
  assert.doesNotMatch(verifyFunction, /clinicalFindings/);
  assert.match(route, /no-store/);
  assert.match(route, /noindex, nofollow, noarchive/);
  assert.match(route, /verify-treatment-document/);
});

test("certificate requires documented clinical details and completed sessions", () => {
  assert.match(component, /session\.status\s*===\s*"completed"/);
  assert.match(component, /clinicalFindings: findings\.trim\(\)/);
  assert.match(component, /treatmentAdvice: advice\.trim\(\)/);
  assert.match(issueFunction, /verification_token_hash/);
  assert.doesNotMatch(component, /private_note/);
  assert.match(detail, /<PatientTreatmentCertificate/);
});

test("A4 PDF contains the agreed clinical, financial, payment and verification sections", () => {
  for (const label of [
    "Patient Information",
    "Clinical Information",
    "Financial Statement",
    "Payment Details",
    "Clinical advice",
    "Scan to verify",
    "Outstanding balance",
  ]) {
    assert.ok(pdf.includes(label), "Missing PDF field: " + label);
  }
  assert.match(pdf, /reimbursement is subject/);
});

test("issuance validates clinician ownership, consent, completed sessions and ledger server-side", () => {
  assert.match(issueFunction, /auth\.getUser\(\)/);
  assert.match(issueFunction, /eq\("clinician_id", clinician\.id\)/);
  assert.match(issueFunction, /eq\("status", "completed"\)/);
  assert.match(issueFunction, /consentConfirmed !== true/);
  assert.match(issueFunction, /personal_patient_ledger/);
  assert.doesNotMatch(component, /\.insert\(\{/);
});
