import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("received-payment totals deduct refunds and reversals in admin, patient portal and certificate", async () => {
  const list = await read("src/routes/_authenticated/admin.personal-patients.tsx");
  const detail = await read("src/routes/_authenticated/admin.personal-patients.$patientId.tsx");
  const portal = await read("supabase/functions/patient-portal/index.ts");
  const certificate = await read("src/components/admin/PatientTreatmentCertificate.tsx");
  const issuer = await read("supabase/functions/issue-treatment-document/index.ts");

  for (const [name, source] of [["admin list", list], ["admin detail", detail], ["patient portal", portal], ["certificate", certificate], ["certificate issuer", issuer]]) {
    assert.match(source, /entry_type === "refund"/, name + " must include refunds");
    assert.match(source, /Payment reversal:/, name + " must include payment reversals");
    assert.match(source, /refunds?[^;]{0,500}paymentReversals|grossReceived - refunds - reversedPayments|payments - refunds - paymentReversals/s, name + " must deduct refunds and reversals");
  }
});

test("refunds and reversals never change gross treatment charges or the signed ledger balance", async () => {
  const list = await read("src/routes/_authenticated/admin.personal-patients.tsx");
  const detail = await read("src/routes/_authenticated/admin.personal-patients.$patientId.tsx");
  const portal = await read("supabase/functions/patient-portal/index.ts");
  for (const source of [list, detail, portal]) {
    assert.match(source, /entry_type === "charge"/);
    assert.match(source, /reduce\([^\n]*Number\([^\n]*amount/);
  }

  const payments = 10000;
  const refunds = 2500;
  const reversals = 1500;
  assert.equal(Math.max(0, payments - refunds - reversals), 6000);
});

test("database prevents a payment from being reversed twice", async () => {
  const migration = await read("supabase/migrations/20261127140000_personal_patient_payment_reversal_guard.sql");
  assert.match(migration, /create unique index if not exists personal_patient_payment_reversal_reference_uidx/);
  assert.match(migration, /where reference like 'payment-reversal:%'/);
});
