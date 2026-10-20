import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import test from "node:test";

const migrationsDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationVersionPattern = /^(\d{14})_.+\.sql$/;

async function migrationNames() {
  const entries = await readdir(migrationsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name);
}

function exactlyOneMigration(names, suffix) {
  const matches = names.filter((name) => name.endsWith(`_${suffix}.sql`));
  assert.equal(
    matches.length,
    1,
    `Expected exactly one migration ending in _${suffix}.sql, found ${matches.length}: ${matches.join(", ") || "none"}`,
  );
  return matches[0];
}

test("every SQL migration has a unique 14-digit version prefix", async () => {
  const names = await migrationNames();
  assert.ok(names.length > 0, "Expected at least one SQL migration");

  const versions = new Map();
  for (const name of names) {
    const match = name.match(migrationVersionPattern);
    assert.ok(match, `Migration basename must start with a 14-digit version prefix: ${name}`);
    const [, version] = match;
    assert.equal(
      versions.has(version),
      false,
      `Duplicate migration version prefix ${version} in ${versions.get(version)} and ${name}`,
    );
    versions.set(version, name);
  }
});

test("internship certificates migration is unique and ordered after clinician service migration", async () => {
  const names = await migrationNames();
  const internshipMigration = exactlyOneMigration(names, "internship_certificates");
  const clinicianMigration = exactlyOneMigration(names, "add_clinician_service_and_cv_fields");
  const internshipVersion = internshipMigration.match(migrationVersionPattern)?.[1];
  const clinicianVersion = clinicianMigration.match(migrationVersionPattern)?.[1];

  assert.ok(internshipVersion, `Could not read the version prefix from ${internshipMigration}`);
  assert.ok(clinicianVersion, `Could not read the version prefix from ${clinicianMigration}`);
  assert.ok(
    internshipVersion > clinicianVersion,
    `${internshipMigration} must be ordered after ${clinicianMigration}`,
  );
});
