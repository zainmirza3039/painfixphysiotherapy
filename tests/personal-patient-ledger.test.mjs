import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const list = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.tsx"),
  "utf8",
);
const routeTree = fs.readFileSync(path.join(root, "src/routeTree.gen.ts"), "utf8");
const detail = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.$patientId.tsx"),
  "utf8",
);
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261109120000_add_personal_patient_ledger.sql"),
  "utf8",
);
const portal = fs.readFileSync(path.join(root, "src/routes/patient-portal.$token.tsx"), "utf8");
const portalFunction = fs.readFileSync(
  path.join(root, "supabase/functions/patient-portal/index.ts"),
  "utf8",
);
const manageFunction = fs.readFileSync(
  path.join(root, "supabase/functions/manage-patient-portal/index.ts"),
  "utf8",
);

test("patient account opens through the typed TanStack route", () => {
  assert.match(list, /<Link[\s\S]*to="\/admin\/personal-patients\/\$patientId"/);
  assert.match(list, /params=\{\{ patientId: p\.id \}\}/);
  assert.doesNotMatch(list, /href=\{`\/admin\/personal-patients/);
  assert.match(routeTree, /path: '\/\$patientId'[\s\S]*getParentRoute: \(\) => AuthenticatedAdminPersonalPatientsRoute/);
});

test("patient lifecycle archives instead of deleting history", () => {
  assert.match(list, /status === "archived" \? "active" : "archived"/);
  assert.match(list, /archived_at: status === "archived"/);
  assert.match(migration, /on public\.personal_patients for update/);
  assert.doesNotMatch(list, /\.delete\(/);
});

test("ledger corrections are additive and historical rows are immutable", () => {
  assert.match(detail, /entry_type: correctionType/);
  assert.match(detail, /reference: crypto\.randomUUID\(\)/);
  assert.match(migration, /before update or delete on public\.personal_patient_ledger/);
  assert.match(migration, /Financial and audit history is immutable/);
});

test("patient portal has noindex and no-referrer metadata", () => {
  assert.match(portal, /name: "robots", content: "noindex, nofollow, noarchive"/);
  assert.match(portal, /name: "referrer", content: "no-referrer"/);
});

test("portal functions do not use wildcard CORS", () => {
  assert.doesNotMatch(portalFunction, /Access-Control-Allow-Origin.*\*/);
  assert.doesNotMatch(manageFunction, /Access-Control-Allow-Origin.*\*/);
  assert.match(portalFunction, /PREVIEW_ORIGIN/);
  assert.match(manageFunction, /PREVIEW_ORIGIN/);
});
