import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  formatMedicalDocumentNumber,
  calculateReceiptTotal,
  summarizeExpenseLedger,
  assertCompletedSessionSources,
} from "../src/admin/medical-documents.contract.ts";

const root = path.resolve(import.meta.dirname, "..");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261119090000_add_medical_documentation_foundation.sql"),
  "utf8",
);
const adminRoute = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.medical-documents.tsx"),
  "utf8",
);
const publicRoute = fs.readFileSync(
  path.join(root, "src/routes/verify-medical-document.tsx"),
  "utf8",
);
const portalFunction = fs.readFileSync(
  path.join(root, "supabase/functions/patient-portal/index.ts"),
  "utf8",
);
const portalManager = fs.readFileSync(
  path.join(root, "supabase/functions/manage-patient-portal/index.ts"),
  "utf8",
);
const portalConfig = fs.readFileSync(path.join(root, "supabase/config.toml"), "utf8");

test("document numbering uses separate fixed prefixes and rejects invalid sequences", () => {
  assert.equal(formatMedicalDocumentNumber("receipt", 1), "PF-R-00001");
  assert.equal(formatMedicalDocumentNumber("estimate", 27), "PF-E-00027");
  assert.equal(formatMedicalDocumentNumber("treatment_report", 100000), "PF-T-100000");
  assert.equal(formatMedicalDocumentNumber("expense_statement", 9), "PF-S-00009");
  assert.throws(() => formatMedicalDocumentNumber("receipt", 0));
  assert.throws(() => formatMedicalDocumentNumber("receipt", 1.5));
});

test("receipts include only negative payment ledger entries and total exact minor units", () => {
  assert.equal(
    calculateReceiptTotal([
      { id: "p1", entry_type: "payment", amount: "-1200.50" },
      { id: "p2", entry_type: "payment", amount: -300 },
    ]),
    1500.5,
  );
  assert.throws(() => calculateReceiptTotal([]));
  assert.throws(() => calculateReceiptTotal([{ id: "c1", entry_type: "charge", amount: 1200 }]));
  assert.throws(() => calculateReceiptTotal([{ id: "p1", entry_type: "payment", amount: 1200 }]));
  assert.throws(() =>
    calculateReceiptTotal([
      { id: "p1", entry_type: "payment", amount: "-10" },
      { id: "p1", entry_type: "payment", amount: "-10" },
    ]),
  );
});

test("expense statement accounting separates receipts, refunds and signed adjustments", () => {
  assert.deepEqual(
    summarizeExpenseLedger([
      { id: "p1", entry_type: "payment", amount: "-2000" },
      { id: "r1", entry_type: "refund", amount: "250.25" },
      { id: "a1", entry_type: "adjustment", amount: "-50" },
    ]),
    { payments: 2000, refunds: 250.25, adjustments: -50, netReceived: 1699.75 },
  );
  assert.throws(() => summarizeExpenseLedger([{ id: "c1", entry_type: "charge", amount: 2000 }]));
});

test("receipt treatment-period filtering includes the entire final calendar day", () => {
  const end = "2026-11-19";
  const endExclusive = new Date(`${end}T00:00:00.000Z`);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  assert.equal(endExclusive.toISOString(), "2026-11-20T00:00:00.000Z");
  assert.match(
    fs.readFileSync(path.join(root, "src/admin/medical-documents.functions.ts"), "utf8"),
    /\.gte\("session_date", `\$\{start\}T00:00:00\.000Z`\)\s*\.lt\("session_date", endExclusive\.toISOString\(\)\)/,
  );
});

test("treatment reports reject planned or duplicate sessions", () => {
  assert.deepEqual(
    assertCompletedSessionSources([
      { id: "s1", status: "completed" },
      { id: "s2", status: "completed" },
    ]),
    ["s1", "s2"],
  );
  assert.throws(() => assertCompletedSessionSources([{ id: "s1", status: "scheduled" }]));
  assert.throws(() =>
    assertCompletedSessionSources([
      { id: "s1", status: "completed" },
      { id: "s1", status: "completed" },
    ]),
  );
});

test("migration restricts browser access and binds documents to clinical source records", () => {
  assert.match(
    migration,
    /foreign key \(patient_id, clinician_id\)[\s\S]*?references public\.personal_patients\(id, clinician_id\)/i,
  );
  assert.match(migration, /grant all on public\.medical_documents to service_role/i);
  assert.match(
    migration,
    /revoke all on public\.medical_documents from public, anon, authenticated/i,
  );
  assert.match(migration, /medical_document_receipt_payment_once_idx/i);
  assert.match(migration, /l\.entry_type = 'payment'[\s\S]*?l\.amount < 0/i);
  assert.match(migration, /s\.status = 'completed'/i);
  assert.match(migration, /medical-documents', 'medical-documents', false/i);
  assert.match(migration, /Invalid medical document status transition/i);
});

test("patient portal uses PIN lockout, hashed bearer tokens and scoped read-only records", () => {
  assert.match(migration, /verify_personal_patient_portal_pin/i);
  assert.match(migration, /v_attempts >= 8[\s\S]*?interval '30 minutes'/i);
  assert.match(migration, /resolve_personal_patient_portal_session/i);
  assert.match(migration, /get_personal_patient_portal_summary/i);
  assert.match(migration, /manage_personal_patient_portal/i);
  assert.match(
    migration,
    /grant execute on function public\.verify_personal_patient_portal_pin[\s\S]*?to service_role/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.manage_personal_patient_portal[\s\S]*?to service_role/i,
  );
  assert.match(portalFunction, /pinDigest\(body\.pin\)/);
  assert.match(portalFunction, /resolve_personal_patient_portal_session/);
  assert.match(portalFunction, /get_personal_patient_portal_summary/);
  assert.match(portalFunction, /eq\("patient_id", patientId\)\.eq\("clinician_id", clinicianId\)/);
  assert.doesNotMatch(portalFunction, /private_notes/);
  assert.doesNotMatch(portalFunction, /password/);
  assert.match(portalManager, /requireAdmin\(req, admin\)/);
  assert.match(portalManager, /manage_personal_patient_portal/);
  assert.match(portalConfig, /\[functions\.patient-portal\][\s\S]*?verify_jwt = false/);
  assert.match(portalConfig, /\[functions\.manage-patient-portal\][\s\S]*?verify_jwt = false/);
  assert.equal((migration.match(/\bcommit;/gi) ?? []).length, 1);
  assert.ok(migration.trimEnd().endsWith("commit;"));
});

test("public document verification has a bounded keyed-IP rate limit", () => {
  assert.match(migration, /medical_document_verification_limits/i);
  assert.match(migration, /consume_medical_document_verification_limit/i);
  assert.match(migration, /interval '15 minutes'/i);
  assert.match(migration, /return v_count <= 20/i);
  assert.match(
    migration,
    /revoke all on function public\.consume_medical_document_verification_limit[\s\S]*?from public, anon, authenticated/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.consume_medical_document_verification_limit[\s\S]*?to service_role/i,
  );
  const functions = fs.readFileSync(
    path.join(root, "src/admin/medical-documents.functions.ts"),
    "utf8",
  );
  assert.match(functions, /getRequest\(\)/);
  assert.match(functions, /x-real-ip/);
  assert.match(functions, /consume_medical_document_verification_limit/);
  assert.match(functions, /status: "rate_limited"/);
});

test("document replacement and stale pending recovery preserve issuance integrity", () => {
  assert.match(migration, /existing\.id is distinct from p_supersedes_document_id/i);
  assert.match(migration, /existing\.status in \('pending', 'issued'\)/i);
  assert.match(migration, /cancel_stale_medical_document_issuances/i);
  assert.match(migration, /created_at < now\(\) - interval '30 minutes'/i);
  assert.match(migration, /grant execute on function public\.cancel_stale_medical_document_issuances[\s\S]*?to service_role/i);
  const functions = fs.readFileSync(
    path.join(root, "src/admin/medical-documents.functions.ts"),
    "utf8",
  );
  assert.match(functions, /p_supersedes_document_id: data\.supersedesDocumentId \?\? null/);
  assert.match(functions, /cancel_stale_medical_document_issuances/);
  const adminUi = fs.readFileSync(
    path.join(root, "src/routes/_authenticated/admin.medical-documents.tsx"),
    "utf8",
  );
  assert.match(adminUi, /Replace an existing issued document/);
  assert.match(adminUi, /doc\.status === "issued"/);
});

test("admin and public routes preserve separate clinical source and privacy boundaries", () => {
  assert.match(adminRoute, /listMedicalDocumentPatients/);
  assert.doesNotMatch(adminRoute, /personalPatientDb/);
  assert.doesNotMatch(adminRoute, /from\("personal_patients"\)/);
  assert.match(adminRoute, /listMedicalDocuments/);
  assert.match(publicRoute, /Cache-Control.*no-store/i);
  assert.match(publicRoute, /X-Robots-Tag.*noindex/i);
  assert.match(publicRoute, /Referrer-Policy.*no-referrer/i);
  assert.match(publicRoute, /verifyMedicalDocument/);
});
