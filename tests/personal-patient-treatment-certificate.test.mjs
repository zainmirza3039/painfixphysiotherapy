import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  "supabase/migrations/20261124120000_personal_patient_treatment_documents.sql",
  "utf8",
);
const component = readFileSync(
  "src/components/admin/PatientTreatmentCertificate.tsx",
  "utf8",
);
const pdf = readFileSync("src/lib/treatment-certificate-pdf.ts", "utf8");
const route = readFileSync("src/routes/verify-certificate.tsx", "utf8");

test("documents are owner-scoped immutable snapshots with revocation", () => {
  assert.match(migration, /verification_token_hash text not null unique/);
  assert.match(migration, /snapshot jsonb not null/);
  assert.match(migration, /Clinicians read their own treatment documents/);
  assert.match(migration, /Clinicians revoke their own treatment documents/);
});

test("public verification exposes an allow-list and no diagnosis", () => {
  assert.match(migration, /verify_personal_patient_treatment_document/);
  assert.match(migration, /'completed_sessions'/);
  assert.doesNotMatch(migration, /'diagnosis'/);
  assert.match(route, /no-store/);
  assert.match(route, /noindex, nofollow, noarchive/);
});

test("certificate counts completed sessions and excludes private notes", () => {
  assert.match(component, /session\.status\s*===\s*"completed"/);
  assert.doesNotMatch(component, /private_note/);
  assert.match(component, /verification_token_hash/);
  assert.match(pdf, /insurance coverage or reimbursement/);
});
