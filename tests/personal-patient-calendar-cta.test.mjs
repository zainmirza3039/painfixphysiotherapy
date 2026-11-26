import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const detail = fs.readFileSync(
  path.join(root, "src/routes/_authenticated/admin.personal-patients.$patientId.tsx"),
  "utf8",
);
const db = fs.readFileSync(path.join(root, "src/admin/personal-patients.db.ts"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase/migrations/20261126150000_personal_patient_calendar_controls.sql"),
  "utf8",
);
const hero = fs.readFileSync(path.join(root, "src/components/site/Hero.tsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");

test("calendar dates are selectable and open date-scoped session actions", () => {
  assert.match(detail, /onClick=\{\(\) => setSelectedCalendarDate\(dateKey\)\}/);
  assert.match(detail, /const selectedDaySessions = visibleSessions\.filter/);
  assert.match(detail, /setSessionDate\(\`\$\{selectedCalendarDate\}T11:00\`\)/);
  assert.match(detail, /navigateCalendarMonth\(-1\)/);
  assert.match(detail, /navigateCalendarMonth\(1\)/);
});

test("scheduled session deletion is soft and cannot erase completed history", () => {
  assert.match(detail, /Only scheduled sessions can be removed/);
  assert.match(detail, /update\(\{ deleted_at: new Date\(\)\.toISOString\(\) \}\)/);
  assert.match(detail, /Session removed from the calendar\. Its audit history is preserved/);
  assert.match(migration, /add column if not exists deleted_at timestamptz/);
  assert.match(migration, /where deleted_at is null/);
  assert.match(db, /is\(column: string, value: null \| boolean\)/);
});

test("off and leave marks are owner-scoped and do not mutate sessions or billing", () => {
  assert.match(detail, /personal_patient_calendar_blocks/);
  assert.match(detail, /block_type: leaveType/);
  assert.match(detail, /This marks the selected date in this patient’s calendar/);
  assert.match(migration, /block_type text not null check \(block_type in \('off', 'leave'\)\)/);
  assert.match(migration, /Clinicians read their personal patient calendar blocks/);
  assert.match(migration, /Clinicians add their personal patient calendar blocks/);
  assert.match(migration, /Clinicians remove their personal patient calendar blocks/);
});

test("calendar marks prevent accidentally scheduling on a blocked date", () => {
  assert.match(detail, /Remove the off \/ leave mark before scheduling a session on this date/);
  assert.match(detail, /disabled=\{Boolean\(selectedDayBlock\)\}/);
});

test("homepage hero booking actions have clear labels and accessible contrast", () => {
  assert.match(hero, /Book a clinic appointment/);
  assert.match(hero, /Book a home visit/);
  assert.match(styles, /\.home-hero__appointment[\s\S]*?background: #007a43;[\s\S]*?color: #ffffff;/);
  assert.match(styles, /\.home-hero__home-visit[\s\S]*?border: 1px solid rgb\(255 255 255 \/ 78%\)/);
});
