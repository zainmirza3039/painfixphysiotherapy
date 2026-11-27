import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("admin certificate list is patient- and clinician-scoped and supports retry", async () => {
  const source = await read("src/components/admin/PatientTreatmentCertificate.tsx");
  assert.match(source, /personal_patient_treatment_documents/);
  assert.match(source, /\.eq\("clinician_id", clinicianId\)/);
  assert.match(source, /\.eq\("patient_id", patient\.id\)/);
  assert.match(source, /documents\.refetch\(\)/);
  assert.match(source, /Download PDF/);
});

test("issued PDF embeds a QR verification URL and downloads a PDF blob", async () => {
  const source = await read("src/lib/treatment-certificate-pdf.ts");
  assert.match(source, /QRCode\.toDataURL\(treatmentVerificationUrl\(snapshot\.verificationToken\)/);
  assert.match(source, /\/verify-certificate\?type=treatment&reference=/);
  assert.match(source, /application\/pdf/);
  assert.match(source, /anchor\.download = snapshot\.documentNumber \+ "\.pdf"/);
});

test("QR verification dispatches treatment tokens to the treatment verifier without exposing clinical notes", async () => {
  const route = await read("src/routes/verify-certificate.tsx");
  const verifier = await read("supabase/functions/verify-treatment-document/index.ts");
  assert.match(route, /type: z\.enum\(\["certificate", "treatment"\]\)/);
  assert.match(route, /verify-treatment-document/);
  assert.match(route, /no-store/);
  assert.match(route, /noindex, nofollow, noarchive/);
  assert.match(verifier, /verification_token_hash/);
  assert.match(verifier, /completed_sessions/);
  assert.doesNotMatch(verifier, /clinicalFindings/);
  assert.doesNotMatch(verifier, /diagnosis/);
});

test("revocation is reason-required, owner-scoped and removes the valid status", async () => {
  const admin = await read("src/components/admin/PatientTreatmentCertificate.tsx");
  const verifier = await read("supabase/functions/verify-treatment-document/index.ts");
  assert.match(admin, /Reason for revoking this certificate/);
  assert.match(admin, /status: "revoked"/);
  assert.match(admin, /\.eq\("clinician_id", clinicianId\)/);
  assert.match(admin, /document\.status === "valid"/);
  assert.match(verifier, /revoked/);
});
