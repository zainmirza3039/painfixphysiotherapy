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
       CREATE POLICY fixture_read ON public.clinician_profiles FOR SELECT USING (is_active AND is_published);
       CREATE ROLE fixture_reader;
       GRANT SELECT ON public.clinician_profiles TO fixture_reader;`);
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
  // A content failure must roll back the column changes as well as the insert.
  assert.throws(() => sql(migration.replace("'923120102560'", "'invalid-number'")));
  assert.equal(
    sql(
      "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='clinician_profiles' AND column_name IN ('service_mode','city','experience','training','research');",
    ),
    "0",
  );
  assert.equal(
    sql("SELECT jsonb_agg(to_jsonb(c) ORDER BY slug) FROM public.clinician_profiles c;"),
    original,
  );
  assert.equal(security(), beforeSecurity);
  sql(migration);
  assert.equal(
    sql("SELECT count(*) FROM public.clinician_profiles WHERE slug='ariba-babar';"),
    "1",
  );
  sql(migration);
  assert.equal(security(), beforeSecurity);
  assert.equal(
    sql(
      "SELECT jsonb_agg(to_jsonb(c) - ARRAY['service_mode','city','experience','training','research'] ORDER BY slug) FROM public.clinician_profiles c WHERE slug LIKE 'fixture-%';",
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
  assert.deepEqual(row.specialties, []);
  assert.deepEqual(row.expertise, [
    "Patient assessment, history taking, functional assessment and documentation",
    "Rehabilitation planning and clinical reasoning",
    "Manual therapy, therapeutic exercise and stretching",
    "Pain management, electrotherapy modalities and kinesiology taping",
    "Chest physiotherapy and cardiopulmonary rehabilitation",
    "Neurological and orthopaedic rehabilitation",
    "Mobility, transfer training and patient education",
    "Communication and multidisciplinary teamwork",
  ]);
  assert.match(row.bio, /Supervised clinical exposure/);
  assert.match(row.experience[0], /supervised exposure/);
  assert.match(
    row.research[0],
    /observational cross-sectional study, University of Sargodha, 2025/,
  );
  assert.match(row.meta_description, /Rahim Yar Khan/);
  assert.doesNotMatch(JSON.stringify({ ...row, training: [] }), /dry needling/i);
  assert.match(row.training.join(" "), /dry needling/);
  assert.doesNotMatch(row.qualifications.join(" "), /dry needling/i);
  assert.match(row.meta_title, /Online Physiotherapy in Rahim Yar Khan/);
  sql(
    "UPDATE public.clinician_profiles SET bio='Owner edited biography', is_published=false, city='Owner edited location', whatsapp_number='923001234567', training=ARRAY['Owner updated training'], photo_url='/clinicians/owner-photo.webp' WHERE slug='ariba-babar';",
  );
  const edited = sql(
    "SELECT row_to_json(c) FROM public.clinician_profiles c WHERE slug='ariba-babar';",
  );
  sql(migration);
  assert.equal(
    sql("SELECT row_to_json(c) FROM public.clinician_profiles c WHERE slug='ariba-babar';"),
    edited,
  );
  assert.equal(
    sql(
      "SELECT bio || ':' || is_published::text FROM public.clinician_profiles WHERE slug='ariba-babar';",
    ),
    "Owner edited biography:false",
  );
  assert.equal(security(), beforeSecurity);
  console.log(
    "PASS: local PostgreSQL migration rerun, exact defaults, constraints, transaction rollback and rerun, four existing profiles/security preserved; migration creates Ariba with correct CV/SEO/contact/photo fields and preserves later owner edits. No production connection.",
  );
} finally {
  if (started) pg("pg_ctl", ["-D", data, "-m", "immediate", "-w", "stop"]);
  rmSync(dir, { recursive: true, force: true });
}
