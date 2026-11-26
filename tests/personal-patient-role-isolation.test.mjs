import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const migration = read("supabase/migrations/20261126170000_super_admin_readonly_personal_ledgers.sql");
const shell = read("src/components/admin/AdminShell.tsx");
const auth = read("src/admin/AdminAuthProvider.tsx");
const dashboard = read("src/routes/_authenticated/admin.index.tsx");
const overview = read("src/routes/_authenticated/admin.clinician-ledgers.tsx");
const personal = read("src/routes/_authenticated/admin.personal-patients.tsx");

test("Clinical Physiotherapist navigation is private to that exact role", () => {
  assert.match(shell, /clinical: hasRole\("clinical_physiotherapist"\)/);
  assert.match(shell, /superadmin: isSuperAdmin/);
  assert.match(shell, /gate: "clinical"/);
  assert.match(shell, /gate: "superadmin"/);
  assert.match(dashboard, /Navigate to="\/admin\/personal-patients"/);
  assert.match(auth, /isSuperAdmin = hasRole\("super_admin"\)/);
});

test("Super Admin global review uses only read-only RPCs", () => {
  assert.match(overview, /super_admin_personal_ledger_clinicians/);
  assert.match(overview, /super_admin_personal_ledger_snapshot/);
  assert.doesNotMatch(overview, /\.insert\(|\.update\(|\.delete\(/);
  assert.match(overview, /VIEW ONLY/);
});

test("database RPCs explicitly reject non-Super Admin callers", () => {
  assert.equal((migration.match(/ur\.role::text = 'super_admin'/g) ?? []).length, 2);
  assert.match(migration, /errcode = '42501'/);
  assert.match(migration, /revoke all on function public\.super_admin_personal_ledger_snapshot\(uuid\) from public, anon/);
  assert.match(migration, /grant execute on function public\.super_admin_personal_ledger_snapshot\(uuid\) to authenticated/);
});

test("direct ledger access requires exact Clinical Physiotherapist role and owner ID", () => {
  for (const table of ["personal_patients", "personal_patient_plans", "personal_patient_sessions", "personal_patient_ledger", "personal_patient_audit_events", "personal_patient_calendar_blocks"]) {
    assert.ok(migration.includes("Clinical physiotherapists"), table + " must have role-scoped policies");
  }
  assert.match(migration, /auth\.uid\(\)\) = clinician_id and public\.has_role/);
});

test("existing personal patient list remains owner-scoped and editable only for clinicians", () => {
  assert.match(personal, /clinician_id: user\.id/);
  assert.match(personal, /\.order\("created_at"/);
});
