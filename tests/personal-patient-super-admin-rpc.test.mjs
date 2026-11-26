import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sql = fs.readFileSync("supabase/migrations/20261126170000_super_admin_readonly_personal_ledgers.sql", "utf8");
const shell = fs.readFileSync("src/components/admin/AdminShell.tsx", "utf8");
const page = fs.readFileSync("src/routes/_authenticated/admin.clinician-ledgers.tsx", "utf8");

test("Super Admin cross-clinician data access is exposed only by guarded read RPCs", () => {
  assert.ok((sql.match(/security definer/gi) ?? []).length >= 2);
  assert.equal((sql.match(/ur.role::text = 'super_admin'/g) ?? []).length, 2);
  assert.match(sql, /revoke all on function public\.super_admin_personal_ledger_clinicians\(\) from public, anon/);
  assert.match(sql, /revoke all on function public\.super_admin_personal_ledger_snapshot\(uuid\) from public, anon/);
});

test("Super Admin route is not granted to ordinary Admin or Staff navigation", () => {
  assert.match(shell, /superadmin: isSuperAdmin/);
  assert.match(shell, /gate: "superadmin"/);
  assert.match(shell, /clinical: hasRole\("clinical_physiotherapist"\)/);
});

test("read-only Super Admin view contains no mutation controls or calls", () => {
  assert.match(page, /VIEW ONLY/);
  assert.doesNotMatch(page, /\.insert\(|\.update\(|\.delete\(/);
  assert.doesNotMatch(page, /Add patient|Record payment|Schedule session|Edit patient|Delete patient/);
});
