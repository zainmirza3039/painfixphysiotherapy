// Requires local PostgreSQL binaries; never reads production database settings.
// Run: node tests/clinician-migration-smoke.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const bin = execFileSync("pg_config", ["--bindir"], { encoding: "utf8" }).trim();
const dir = mkdtempSync(path.join(tmpdir(), "painfix-clinician-pg-"));
const data = path.join(dir, "data");
let started = false;
const pg = (name, args) =>
  execFileSync(path.join(bin, name), args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
const sql = (statement) =>
  execFileSync(
    path.join(bin, "psql"),
    ["-X", "-h", dir, "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-At"],
    { input: statement, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  ).trim();
const file = (name) => readFileSync(new URL(`../${name}`, import.meta.url), "utf8");
try {
  pg("initdb", ["-D", data, "-U", "postgres", "-A", "trust", "--no-locale", "--encoding=UTF8"]);
  pg("pg_ctl", [
    "-D",
    data,
    "-l",
    path.join(dir, "server.log"),
    "-o",
    `-k ${dir} -c listen_addresses=''`,
    "-w",
    "start",
  ]);
  started = true;
  // Only the original table definition is a fixture. Never replay the old migration.
  const old = file("supabase/migrations/20261017090000_add_clinician_profile_management.sql");
  const definition = old.match(/CREATE TABLE public\.clinician_profiles \([\s\S]*?\n\);/)?.[0];
  assert.ok(definition);
  sql(definition);
  sql(`INSERT INTO public.clinician_profiles (slug,name,full_name,designation,professional_title)
       SELECT 'fixture-' || i, 'Fixture ' || i, 'Fixture ' || i, 'Physiotherapist', 'DPT'
       FROM generate_series(1,4) i;
       ALTER TABLE public.clinician_profiles ENABLE ROW LEVEL SECURITY;
       CREATE POLICY fixture_read ON public.clinician_profiles FOR SELECT USING (is_active AND is_published);`);
  const original = sql(
    "SELECT jsonb_agg(to_jsonb(c) ORDER BY slug) FROM public.clinician_profiles c;",
  );
  const security = () =>
    sql(
      "SELECT relrowsecurity::text || ':' || coalesce(relacl::text,'') FROM pg_class WHERE oid='public.clinician_profiles'::regclass; SELECT pg_get_expr(polqual, polrelid) FROM pg_policy WHERE polrelid='public.clinician_profiles'::regclass ORDER BY polname;",
    );
  const beforeSecurity = security();
  const migration = file(
    "supabase/migrations/20261021000000_add_clinician_service_and_cv_fields.sql",
  );
  sql(migration);
  sql(migration);
  assert.equal(security(), beforeSecurity);
  assert.equal(
    sql(
      "SELECT jsonb_agg(to_jsonb(c) - ARRAY['service_mode','city','experience','training','research'] ORDER BY slug) FROM public.clinician_profiles c;",
    ),
    original,
  );
  assert.equal(
    sql(
      "SELECT count(*) FROM public.clinician_profiles WHERE service_mode='clinic' AND city='Multan' AND experience='{}'::text[] AND training='{}'::text[] AND research='{}'::text[];",
    ),
    "4",
  );
  for (const patch of [
    "service_mode='hybrid'",
    "service_mode=NULL",
    "city=NULL",
    "city=' '",
    "experience=NULL",
    "training=NULL",
    "research=NULL",
  ]) {
    assert.throws(
      () => sql(`UPDATE public.clinician_profiles SET ${patch} WHERE slug='fixture-1';`),
      undefined,
      patch,
    );
  }
  const seed = file("supabase/seeds/ariba-babar.sql");
  sql(seed);
  sql(seed);
  assert.equal(sql("SELECT count(*) FROM public.clinician_profiles;"), "5");
  const row = JSON.parse(
    sql("SELECT row_to_json(c) FROM public.clinician_profiles c WHERE slug='ariba-babar';"),
  );
  assert.equal(row.service_mode, "online_only");
  assert.equal(row.city, "Rahim Yar Khan, Pakistan");
  assert.equal(row.whatsapp_number, "923120102560");
  assert.equal(row.photo_url, null);
  assert.equal(row.photo_path, null);
  assert.equal(row.years_experience, null);
  assert.equal(row.is_active && row.is_published, true);
  assert.equal(row.experience.length, 4);
  assert.equal(row.qualifications.length, 3);
  assert.match(row.training.join(" "), /dry needling/);
  assert.doesNotMatch(row.qualifications.join(" "), /dry needling/i);
  assert.match(row.meta_title, /Online Physiotherapy in Rahim Yar Khan/);
  sql(
    "UPDATE public.clinician_profiles SET bio='Owner edited biography', is_published=false WHERE slug='ariba-babar';",
  );
  sql(seed);
  assert.equal(
    sql(
      "SELECT bio || ':' || is_published::text FROM public.clinician_profiles WHERE slug='ariba-babar';",
    ),
    "Owner edited biography:false",
  );
  assert.equal(security(), beforeSecurity);
  console.log(
    "PASS: local PostgreSQL migration rerun, exact defaults, constraints, four existing profiles/security preserved; seed rerun, CV/SEO/contact/photo fields, and owner edits preserved. No production connection.",
  );
} finally {
  if (started) pg("pg_ctl", ["-D", data, "-m", "immediate", "-w", "stop"]);
  rmSync(dir, { recursive: true, force: true });
}
