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

test("admin and public routes preserve separate clinical source and privacy boundaries", () => {
  assert.match(adminRoute, /listMedicalDocumentPatients/);
  assert.match(adminRoute, /listMedicalDocuments/);
  assert.match(publicRoute, /Cache-Control.*no-store/i);
  assert.match(publicRoute, /X-Robots-Tag.*noindex/i);
  assert.match(publicRoute, /Referrer-Policy.*no-referrer/i);
  assert.match(publicRoute, /verifyMedicalDocument/);
});
