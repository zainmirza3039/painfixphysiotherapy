import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public contact and home visit forms use server-side submission handlers", () => {
  const contact = read("../src/components/site/ContactForm.tsx");
  const homeVisit = read("../src/components/site/HomeVisitForm.tsx");
  const handlers = read("../src/lib/public-submissions.functions.ts");

  assert.match(contact, /submitContactMessage/);
  assert.doesNotMatch(contact, /from\(["']contact_submissions["']\)\.insert/);
  assert.match(homeVisit, /createHomeVisitRequest/);
  assert.doesNotMatch(homeVisit, /from\(["']home_visit_requests["']\)\.insert/);
  assert.match(handlers, /check_public_submission_rate_limit/);
  assert.match(handlers, /VERCEL === "1"/);
  assert.match(handlers, /x-vercel-forwarded-for/);
  assert.match(handlers, /\.from\("contact_submissions"\)\\s*\.insert/);
  assert.match(handlers, /\.from\("home_visit_requests"\)\\s*\.insert/);
});

test("database enforces persistent submission and storage upload limits", () => {
  const migration = read("../supabase/migrations/20261106100000_add_public_submission_and_storage_rate_limits.sql");

  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /GRANT EXECUTE[\s\S]*TO service_role/);
  assert.match(migration, /REVOKE ALL ON TABLE public\.storage_upload_rate_limits[\s\S]*FROM PUBLIC, anon, authenticated, service_role/);
  assert.match(migration, /BEFORE INSERT ON storage\.objects/);
  assert.match(migration, /site-media/);
  assert.match(migration, /medical-reports/);
  assert.match(migration, /actor_limit/);
  assert.match(migration, /global_limit/);
});

test("Gitleaks workflow scans all fetched Git refs and history", () => {
  const workflow = read("../.github/workflows/secret-history-scan.yml");
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /--log-opts="--all --full-history/);
  assert.match(workflow, /gitleaks:v8\.30\.1 git/);
  assert.match(workflow, /schedule:/);
});
