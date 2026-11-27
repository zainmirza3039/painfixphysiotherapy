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
const reversalMigration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261127140000_personal_patient_payment_reversal_guard.sql"),
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
  const normalizedDetail = detail.replace(/\s+/g, " ");
  assert.ok(normalizedDetail.includes("Do not enter 0 or a minus sign to clear the balance"));
  assert.ok(
    normalizedDetail.includes(
      "You never need to type a minus sign or manually set the balance to zero",
    ),
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
    /to: "\/admin\/personal-patients",\s*label: "Personal patient ledger",\s*icon: UserCircle,\s*gate: "ownledger"/,
  );
  assert.ok(
    adminShell.includes('"/admin/personal-patients"') &&
      adminShell.includes('"/admin/clinician-ledgers"') &&
      adminShell.includes('"/admin/home-visits"'),
  );
});

const patientDetailSource = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.$patientId.tsx"),
  "utf8",
);
const portalSource = fs.readFileSync(
  path.join(root, "src/routes/patient-portal.$token.tsx"),
  "utf8",
);
const importComponent = fs.readFileSync(
  path.join(root, "src/components/admin/PatientLedgerImport.tsx"),
  "utf8",
);

test("billing plans persist and display their validity dates and package utilisation", () => {
  assert.match(patientDetailSource, /starts_on: planStartsOn \|\| null/);
  assert.match(patientDetailSource, /ends_on: planEndsOn \|\| null/);
  assert.match(patientDetailSource, /Plan end date cannot be earlier than its start date/);
  assert.match(patientDetailSource, /completed · .*remaining/);
  assert.match(patientDetailSource, /starts_on,ends_on,is_active/);
});

test("custom and per-session billing plans validate fee bounds and precision", () => {
  assert.match(patientDetailSource, /maximum two decimal places/);
  assert.match(patientDetailSource, /Plan title must be 1–100 characters/);
  assert.match(patientDetailSource, /planType === "custom" &&\s*perFee != null/);
});

test("import preview deduplicates by phone or name and counts distinct existing patient matches", () => {
  assert.match(importComponent, /const firstByPhone = new Map<string, number>\(\)/);
  assert.match(importComponent, /const firstByName = new Map<string, number>\(\)/);
  assert.match(importComponent, /duplicateRows: Math\.max\(0, rows\.length - uniqueRoots\.size\)/);
  assert.match(importComponent, /matchedPatientIds\.size/);
  assert.match(importComponent, /more than 1,000 usable rows/);
});

test("patient import preview blocks invalid rows and validates edited values before submission", () => {
  assert.match(importParser, /export function getPatientImportRowErrors/);
  assert.match(importParser, /Package sessions must be a whole number from 1 to 1,000/);
  assert.match(importComponent, /Correct validation errors in/);
  assert.match(importComponent, /summary\.invalidRows > 0/);
  assert.match(importComponent, /Rows needing correction/);
});

test("spreadsheet import rejects oversized files and warns about malformed financial values", () => {
  assert.match(importParser, /file\.size > 10 \* 1024 \* 1024/);
  assert.match(importParser, /Invalid or out-of-range value in/);
  assert.match(importParser, /More than two decimal places in/);
  assert.match(importParser, /Do not combine a package fee and a per-session fee/);
});

test("patient portal uses the PainFix navy and restrained green clinical layout", () => {
  assert.match(portalSource, /bg-\[#F2F5F9\]/);
  assert.match(portalSource, /text-\[#00A859\]/);
  assert.match(portalSource, /Physiotherapy Clinic · Multan/);
});

test("CSV parser preserves quoted multiline fields and rejects unclosed quotes", () => {
  assert.match(importParser, /function parseCsvRecords\(source: string, delimiter: string\)/);
  assert.match(importParser, /CSV contains an unclosed quoted field/);
  assert.match(importParser, /records\s*\.slice\(1\)/);
});

test("sessions cannot be scheduled outside billing plan validity dates in the UI or database", () => {
  assert.match(patientDetailSource, /This session is before the billing plan start date/);
  assert.match(patientDetailSource, /This session is after the billing plan end date/);
  const dateGuard = fs.readFileSync(
    path.join(root, "supabase/migrations/20261127020000_personal_patient_plan_date_guard.sql"),
    "utf8",
  );
  assert.match(dateGuard, /security invoker/);
  assert.match(dateGuard, /Asia\/Karachi/);
  assert.match(
    dateGuard,
    /before insert or update of plan_id, patient_id, clinician_id, session_date/,
  );
  assert.match(dateGuard, /Session date is before the billing plan start date/);
  assert.match(dateGuard, /Session date is after the billing plan end date/);
});

test("incorrect patient payments can be excluded without mutating the original ledger entry", () => {
  assert.match(detail, /const reversePayment = useMutation/);
  assert.match(detail, /entry_type: "adjustment"/);
  assert.match(detail, /Payment reversal:/);
  assert.match(detail, /Exclude from totals/);
  assert.match(detail, /already been reversed/);
  assert.match(
    detail,
    /const paymentReversals = data\?\.ledger[\s\S]*startsWith\("Payment reversal:"\)/,
  );
  assert.match(detail, /Math.max\(0,[\s\S]*\) - paymentReversals\)/);
  assert.match(list, /grossReceived[\s\S]*reversedPayments/);
  assert.match(portalFunction, /grossReceived[\s\S]*reversedPayments/);
});

test("patient portal exposes a working verification action, language switch and theme switch", () => {
  assert.match(portal, /open: "Verify \/ OK"/);
  assert.match(portal, /verify\.mutate\(\)/);
  assert.match(portal, /onClick=\{\(\) => setLanguage\(isUrdu \? "en" : "ur"\)\}/);
  assert.match(portal, /setTheme\(theme === "light" \? "dark" : "light"\)/);
  assert.match(portal, /bg-slate-950 text-slate-100/);
  assert.match(portal, /Noto\+Nastaliq\+Urdu/);
});

test("personal patient list uses a mobile card layout and desktop table layout", () => {
  assert.match(list, /space-y-3 p-3 sm:hidden/);
  assert.match(list, /hidden overflow-x-auto sm:block/);
  assert.match(detail, /min-w-0 w-full space-y-6 overflow-x-hidden/);
});

test("payment reversal references are unique per clinician at the database level", () => {
  assert.match(
    reversalMigration,
    /create unique index if not exists personal_patient_payment_reversal_reference_uidx/,
  );
  assert.match(reversalMigration, /where reference like 'payment-reversal:%'/);
});
