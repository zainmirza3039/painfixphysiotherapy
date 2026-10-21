import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = new URL(
  "../supabase/migrations/20261021050000_refine_ariba_online_seo.sql",
  import.meta.url,
);

test("Ariba SEO migration targets only the existing online-only profile", async () => {
  const sql = await readFile(migration, "utf8");
  assert.match(sql, /UPDATE public\.clinician_profiles/);
  assert.match(sql, /WHERE slug = 'ariba-babar'/);
  assert.match(sql, /service_mode = 'online_only'/);
  assert.match(sql, /online video physiotherapy consultations/i);
  assert.match(sql, /Online Physiotherapist in Rahim Yar Khan/);
  assert.match(sql, /Video consultation/);
  assert.doesNotMatch(
    sql,
    /CREATE TABLE|DROP TABLE|TRUNCATE|physical branch|best physiotherapist/i,
  );
});

test("Ariba SEO copy does not imply a Rahim Yar Khan physical clinic", async () => {
  const sql = await readFile(migration, "utf8");
  assert.match(sql, /no physical PainFix clinic or walk-in appointment/);
  assert.doesNotMatch(sql, /Rahim Yar Khan (clinic|branch)/i);
});
