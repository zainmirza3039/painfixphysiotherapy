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
  assert.match(
    routeTree,
    /path: '\/\$patientId'[\s\S]*getParentRoute: \(\) => AuthenticatedAdminPersonalPatientsRoute/,
  );
});

test("patient lifecycle archives instead of deleting history", () => {
  assert.match(list, /archived_at: status === "archived"/);
  assert.match(migration, /on public\.personal_patients for update/);
  assert.doesNotMatch(list, /\.delete\(/);
});

test("patient creation confirms the inserted record before reporting success", () => {
  assert.match(list, /\.insert\(\{[\s\S]*?\}\)\s*\.select\("id"\)\s*\.single\(\)/);
  assert.match(list, /Patient creation could not be confirmed/);
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

test("ledger query failures are not silently presented as zero balances", () => {
  assert.match(detail, /Could not load patient/);
  assert.match(list, /Could not load patient financial records/);
});

test("ledger corrections use plain-language choices and map to signed immutable entries", () => {
  assert.ok(detail.includes('value="add_charge">I forgot to add a charge'));
  assert.ok(detail.includes('value="reduce_balance">Waive or reduce an amount owed'));
  assert.ok(detail.includes('entry_type: correctionType === "refund" ? "refund" : "adjustment"'));
  assert.ok(detail.includes('amount: correctionType === "reduce_balance" ? -amount : amount'));
  assert.doesNotMatch(detail, /correctionDirection/);
});

test("prepaid package visits do not ask the clinician to enter zero manually", () => {
  assert.ok(detail.includes('activePlan?.plan_type === "package"'));
  assert.ok(detail.includes("Included in prepaid package"));
  assert.ok(detail.includes("No extra fee is needed"));
});

test("payment instructions explain that balances update automatically", () => {
  const normalizedDetail = detail.replace(/\\s+/g, " ");
  assert.ok(normalizedDetail.includes("Do not enter 0 or a minus sign to clear the balance"));
  assert.ok(
    normalizedDetail.includes("You never need to type a minus sign or manually set the balance to zero"),
  );
});

test("patient lifecycle supports active, on-hold, discharged and archived", () => {
  for (const status of ["active", "on_hold", "discharged", "archived"]) {
    assert.ok(list.includes(`value="${status}"`));
  }
});

test("portal functions do not use wildcard CORS", () => {
  assert.doesNotMatch(portalFunction, /Access-Control-Allow-Origin.*\*/);
  assert.doesNotMatch(manageFunction, /Access-Control-Allow-Origin.*\*/);
  assert.match(portalFunction, /PREVIEW_ORIGIN/);
  assert.match(manageFunction, /PREVIEW_ORIGIN/);
});

const importParser = fs.readFileSync(path.join(root, "src/admin/patient-ledger-import.ts"), "utf8");
const importUi = fs.readFileSync(
  path.join(root, "src/components/admin/PatientLedgerImport.tsx"),
  "utf8",
);
const importMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261125120000_personal_patient_atomic_import.sql"),
  "utf8",
);

test("personal patient import is available from the personal-patient workspace", () => {
  assert.match(list, /<PatientLedgerImport/);
  assert.match(importUi, /import_personal_patient_batch/);
});

test("bulk import is one authenticated database transaction, not sequential client writes", () => {
  assert.match(importMigration, /security invoker/);
  assert.match(importMigration, /auth\.uid\(\)/);
  assert.match(importMigration, /jsonb_array_length\(p_rows\) > 1000/);
  assert.match(
    importMigration,
    /grant execute on function public\.import_personal_patient_batch\(jsonb, text\) to authenticated/,
  );
  assert.doesNotMatch(importUi, /for \(const row of rows\)/);
  assert.doesNotMatch(importUi, /\.from\("personal_patient_ledger"\)/);
});

test("portal session storage has row-level security enabled", () => {
  assert.match(
    importMigration,
    /alter table public\.personal_patient_portal_sessions enable row level security/,
  );
});

test("imported per-session visits retain their fee and package visits remain prepaid", () => {
  assert.match(importParser, /sessionFee: number \| null/);
  assert.match(importUi, /value=\{row\.sessionFee \?\? ""\}/);
  assert.match(importMigration, /v_session_charge := v_session_fee/);
  assert.match(importMigration, /v_plan_type := 'package'/);
  assert.match(
    importMigration,
    /coalesce\(v_session_label, 'Imported session'\), v_session_charge/,
  );
});

test("imported payments have a batch-scoped idempotency reference", () => {
  assert.match(importMigration, /personal-patient-import:/);
  assert.match(importMigration, /on conflict \(clinician_id, reference\)/);
});

test("spreadsheet parser supports CSV and XLSX without an untracked dependency", () => {
  assert.match(importParser, /export async function parsePatientFile/);
  assert.match(importParser, /\.xlsx/);
  assert.match(importParser, /DecompressionStream\("deflate-raw"\)/);
  assert.match(importUi, /accept="\.csv,\.xlsx/);
});

test("XLSX rows are separated with real newlines and slash dates use day/month/year", () => {
  assert.match(importParser, /\.join\("\\n"\)/);
  assert.match(importParser, /Slash-formatted dates use day\/month\/year/);
  assert.match(importParser, /value\.match\(\/\^\(\\d\{1,2\}\)/);
  assert.match(importParser, /Date\.UTC\(year, month, day, 12\)/);
});

test("import preview remains explicit before committing the batch", () => {
  assert.match(importUi, /No records are saved until you confirm/);
  assert.match(importUi, /Confirm and import/);
  assert.match(importUi, /SHA-256/);
});

test("import preview supports editing before confirmation and public Sheets links", () => {
  assert.match(importUi, /setRows\(\(current\)/);
  assert.match(importUi, /Google Sheets link/);
  assert.match(importUi, /docs\.google\.com/);
});

test("patient payments can produce printable receipts", () => {
  assert.match(detail, /const printReceipt = \(entry: Entry\)/);
  assert.match(detail, /e\.entry_type === "payment"/);
  assert.match(detail, /Payment receipt/);
});

test("attendance certificates only report completed-session attendance", () => {
  assert.match(detail, /const printAttendanceCertificate = \(\)/);
  assert.match(detail, /session\.status === "completed"/);
  assert.match(detail, /not a medical fitness certificate/);
});

test("patient portal package balance uses the selected plan identifier", () => {
  const portalFunction = fs.readFileSync(
    path.join(root, "supabase/functions/patient-portal/index.ts"),
    "utf8",
  );
  assert.match(portalFunction, /select\("id,title,plan_type,package_sessions/);
  assert.match(portalFunction, /session\.plan_id === activePlan\.id/);
});

const attendance = fs.readFileSync(
  path.join(root, "src/components/admin/DailyAttendanceLedger.tsx"),
  "utf8",
);
const attendanceMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261125130000_personal_patient_attendance_batch.sql"),
  "utf8",
);

test("daily attendance is staged before a single final confirmation", () => {
  assert.match(attendance, /Nothing is saved and no charge is posted until you confirm/);
  assert.match(attendance, /Review attendance/);
  assert.match(attendance, /Confirm and save/);
  assert.match(attendance, /type="datetime-local"/);
  assert.match(attendance, /Session fee \(PKR\)/);
});

test("attendance batch is atomic and owner-scoped", () => {
  assert.match(attendanceMigration, /security invoker/);
  assert.match(attendanceMigration, /auth\.uid\(\)/);
  assert.match(attendanceMigration, /jsonb_array_length\(p_rows\) > 250/);
  assert.match(attendanceMigration, /p\.clinician_id = v_clinician/);
  assert.match(attendanceMigration, /status = 'completed'/);
  assert.match(
    attendanceMigration,
    /grant execute on function public\.record_personal_patient_attendance_batch\(jsonb\) to authenticated/,
  );
});

test("prepaid package sessions are not charged twice", () => {
  assert.match(attendanceMigration, /Package fees are charged when the plan is created/);
  assert.match(attendanceMigration, /v_plan_type = 'package' and v_charge <> 0/);
});

const adminShell = fs.readFileSync(path.join(root, "src/components/admin/AdminShell.tsx"), "utf8");

test("Patient Ledger is included in a visible admin navigation section", () => {
  assert.match(
    adminShell,
    /to: "\/admin\/personal-patients",\s*label: "Personal patient ledger",\s*icon: UserCircle,\s*gate: "staff"/,
  );
  assert.match(
    adminShell,
    /label: "Patient care",\s*routes: \[\s*"\/admin\/personal-patients",\s*"\/admin\/patients",\s*"\/admin\/appointments",\s*"\/admin\/home-visits",\s*\]/,
  );
});
