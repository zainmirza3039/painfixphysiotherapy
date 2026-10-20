-- Least-privilege hardening for the existing public submission API.
-- This migration reuses the existing tables/API; it creates no duplicate table,
-- endpoint, or notification integration.
--
-- Run the separate supabase/manual/..._supabase_admin_public_defaults.sql step
-- first through a connection authorized as supabase_admin. This migration
-- deliberately fails before making changes if that owner-only step is missing.

BEGIN;

-- Fail before any DDL/ACL changes when the executor, catalog drift, RLS state,
-- inherited grants, or default ACL scope differs from the reviewed production
-- assumptions. In particular, the normal migration executor is postgres, not
-- a superuser and not a member of supabase_admin.
DO $preflight$
DECLARE
  anon_role oid;
  authenticated_role oid;
  required_table text;
BEGIN
  IF to_regrole('anon') IS NULL
     OR to_regrole('authenticated') IS NULL
     OR to_regrole('service_role') IS NULL
     OR to_regrole('postgres') IS NULL
     OR to_regrole('supabase_admin') IS NULL THEN
    RAISE EXCEPTION 'Required Supabase roles are missing; no changes made';
  END IF;

  IF NOT pg_has_role(current_user, 'postgres', 'MEMBER') THEN
    RAISE EXCEPTION
      'Run this migration as postgres or an authorized member of postgres; current_user=%',
      current_user;
  END IF;

  anon_role := (SELECT oid FROM pg_roles WHERE rolname = 'anon');
  authenticated_role := (SELECT oid FROM pg_roles WHERE rolname = 'authenticated');

  IF EXISTS (
    SELECT 1
    FROM pg_auth_members AS m
    WHERE m.member IN (anon_role, authenticated_role)
  ) THEN
    RAISE EXCEPTION
      'anon/authenticated inherit another role; review inherited grants before applying';
  END IF;

  IF NOT has_schema_privilege('anon', 'public', 'USAGE')
     OR NOT has_schema_privilege('authenticated', 'public', 'USAGE')
     OR has_schema_privilege('anon', 'public', 'CREATE')
     OR has_schema_privilege('authenticated', 'public', 'CREATE') THEN
    RAISE EXCEPTION
      'Unexpected public schema privileges; expected USAGE and no CREATE for anon/authenticated';
  END IF;

  -- The UI and API references these existing public tables. Do not run against
  -- a partially migrated or differently owned schema.
  FOREACH required_table IN ARRAY ARRAY[
    'appointments', 'blog_posts', 'calculator_settings', 'clinic_settings',
    'contact_submissions', 'fitness_content', 'home_visit_requests',
    'patient_visits', 'patients', 'profiles', 'user_roles'
  ] LOOP
    IF to_regclass(format('public.%I', required_table)) IS NULL THEN
      RAISE EXCEPTION 'Required existing table public.% is missing', required_table;
    END IF;
  END LOOP;

  -- The blanket relation revokes below are safe only for the exact reviewed
  -- inventory. Refuse new or missing tables, views, foreign tables, or sequences.
  IF EXISTS (
    WITH expected(relname, relkind) AS (
      VALUES
        ('appointments'::text, 'r'::text),
        ('blog_posts', 'r'),
        ('calculator_settings', 'r'),
        ('clinic_settings', 'r'),
        ('contact_submissions', 'r'),
        ('fitness_content', 'r'),
        ('home_visit_requests', 'r'),
        ('patient_visits', 'r'),
        ('patients', 'r'),
        ('profiles', 'r'),
        ('user_roles', 'r')
    ),
    actual(relname, relkind) AS (
      SELECT c.relname::text, c.relkind::text
      FROM pg_class AS c
      JOIN pg_namespace AS n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
    )
    SELECT 1
    FROM expected AS e
    WHERE NOT EXISTS (
      SELECT 1 FROM actual AS a
      WHERE a.relname = e.relname AND a.relkind = e.relkind
    )
    UNION ALL
    SELECT 1
    FROM actual AS a
    WHERE NOT EXISTS (
      SELECT 1 FROM expected AS e
      WHERE e.relname = a.relname AND e.relkind = a.relkind
    )
  ) THEN
    RAISE EXCEPTION
      'Public relation inventory differs from the reviewed set; no changes made';
  END IF;

  -- The reviewed catalog had no direct PUBLIC relation ACL entries. Do not
  -- silently erase a newly introduced PUBLIC grant during the blanket revokes.
  IF EXISTS (
    SELECT 1
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) AS acl
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
      AND acl.grantee = 0
  ) THEN
    RAISE EXCEPTION
      'Direct PUBLIC relation privileges exist in public; review before applying';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
      AND NOT pg_has_role(current_user, c.relowner, 'MEMBER')
  ) THEN
    RAISE EXCEPTION
      'Migration executor is not an authorized owner/member for every public relation and sequence';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY (ARRAY[
        'appointments', 'blog_posts', 'calculator_settings', 'clinic_settings',
        'contact_submissions', 'fitness_content', 'home_visit_requests',
        'patient_visits', 'patients', 'profiles', 'user_roles'
      ])
      AND c.relkind IN ('r', 'p')
      AND NOT c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'RLS must be enabled on every application table before grants change';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (VALUES
      ('home_visit_requests', 'full_name'),
      ('home_visit_requests', 'phone'),
      ('home_visit_requests', 'address'),
      ('home_visit_requests', 'maps_location'),
      ('home_visit_requests', 'patient_age'),
      ('home_visit_requests', 'medical_condition'),
      ('home_visit_requests', 'preferred_date'),
      ('home_visit_requests', 'preferred_time'),
      ('home_visit_requests', 'report_url'),
      ('home_visit_requests', 'notes'),
      ('contact_submissions', 'name'),
      ('contact_submissions', 'email'),
      ('contact_submissions', 'phone'),
      ('contact_submissions', 'message')
    ) AS expected(table_name, column_name)
    WHERE NOT EXISTS (
      SELECT 1
      FROM pg_attribute AS a
      WHERE a.attrelid = to_regclass(format('public.%I', expected.table_name))
        AND a.attname = expected.column_name
        AND a.attnum > 0
        AND NOT a.attisdropped
    )
  ) THEN
    RAISE EXCEPTION 'Home Visit/contact schema drift detected; no changes made';
  END IF;

  IF to_regprocedure('public.is_staff(uuid)') IS NULL
     OR to_regprocedure('public.is_admin(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Required RLS role helpers are missing';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc AS p
    JOIN pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND (
        (p.proname IN ('is_staff', 'is_admin')
          AND p.pronargs = 1
          AND format_type(p.proargtypes[0], NULL) = 'uuid')
        OR
        (p.proname = 'has_role'
          AND p.pronargs = 2
          AND format_type(p.proargtypes[0], NULL) = 'uuid')
      )
      AND NOT pg_has_role(current_user, p.proowner, 'MEMBER')
  ) THEN
    RAISE EXCEPTION 'Migration executor does not own all affected RLS helper functions';
  END IF;

  -- Global defaults affect objects in every schema and cannot be revoked for
  -- public alone. Stop for explicit review instead of broadening this change.
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclobjtype IN ('r', 'S')
      AND d.defaclnamespace = 0
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
  ) THEN
    RAISE EXCEPTION
      'Global table/sequence defaults grant PUBLIC/anon/authenticated; review all-schema impact before applying';
  END IF;

  -- The observed public defaults have only two owners. Do not silently leave a
  -- third object's defaults open or alter another owner without review.
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    JOIN pg_roles AS owner ON owner.oid = d.defaclrole
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclobjtype IN ('r', 'S')
      AND d.defaclnamespace = 'public'::regnamespace
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
      AND owner.rolname NOT IN ('postgres', 'supabase_admin')
  ) THEN
    RAISE EXCEPTION
      'Unexpected public-schema table/sequence defaults exist for another owner; review before applying';
  END IF;

  -- postgres cannot alter supabase_admin's defaults in this project. Require
  -- that the separate owner-authorized step has completed before any DDL here.
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclrole = 'supabase_admin'::regrole
      AND d.defaclnamespace = 'public'::regnamespace
      AND d.defaclobjtype IN ('r', 'S')
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
  ) THEN
    RAISE EXCEPTION
      'supabase_admin public defaults are still broad; execute the owner-authorized manual step first';
  END IF;
END;
$preflight$;

-- Additive admin-workflow fields. Existing rows are retained and any preexisting
-- NULL status is normalized before enforcing the same non-NULL default.
ALTER TABLE public.home_visit_requests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
UPDATE public.home_visit_requests SET status = 'new' WHERE status IS NULL;
ALTER TABLE public.home_visit_requests
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
UPDATE public.contact_submissions SET status = 'new' WHERE status IS NULL;
ALTER TABLE public.contact_submissions
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN status SET NOT NULL;

-- Keep the existing Home Visit table/API and constrain public form payloads.
DROP POLICY IF EXISTS "Anyone can submit a home visit request"
  ON public.home_visit_requests;
CREATE POLICY "Anyone can submit a home visit request"
  ON public.home_visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(full_name)) BETWEEN 1 AND 200
    AND char_length(btrim(phone)) BETWEEN 1 AND 40
    AND char_length(btrim(address)) BETWEEN 1 AND 1000
    AND (medical_condition IS NULL OR char_length(medical_condition) <= 200)
    AND (maps_location IS NULL OR char_length(maps_location) <= 2048)
    AND (patient_age IS NULL OR patient_age BETWEEN 0 AND 120)
    AND (preferred_time IS NULL OR char_length(preferred_time) <= 20)
    AND (report_url IS NULL OR char_length(report_url) <= 255)
    AND (notes IS NULL OR char_length(notes) <= 5000)
  );

DROP POLICY IF EXISTS "Anyone can submit a contact message"
  ON public.contact_submissions;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 200
    AND char_length(btrim(message)) BETWEEN 1 AND 5000
    AND (email IS NULL OR char_length(email) <= 320)
    AND (phone IS NULL OR char_length(phone) <= 40)
  );

-- Preserve existing staff reads. Staff may update Home Visit status; only an
-- admin may delete a request. The existing helper functions remain authoritative.
DROP POLICY IF EXISTS "Staff can update home visit requests"
  ON public.home_visit_requests;
CREATE POLICY "Staff can update home visit requests"
  ON public.home_visit_requests
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete home visit requests"
  ON public.home_visit_requests;
CREATE POLICY "Admins can delete home visit requests"
  ON public.home_visit_requests
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- The Messages UI reads as staff but changes/deletes only as an admin.
DROP POLICY IF EXISTS "Admins can update contact messages"
  ON public.contact_submissions;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete contact messages"
  ON public.contact_submissions;
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_submissions
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Start from no direct application-role/PUBLIC privileges, then grant only the
-- operations exercised by the current UI. RLS remains enabled and is still the
-- staff/admin authorization boundary for all authenticated DML.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public
  FROM PUBLIC, anon, authenticated;

-- Anonymous browser workflows: published blog/profile reads and the two forms.
-- No anonymous SELECT on calculator_settings or fitness_content is granted:
-- the current public frontend reads neither table directly.
GRANT SELECT ON TABLE public.blog_posts, public.profiles TO anon;
GRANT INSERT (name, email, phone, message)
  ON TABLE public.contact_submissions TO anon;
GRANT INSERT (
  full_name, phone, address, maps_location, patient_age, medical_condition,
  preferred_date, preferred_time, report_url, notes
) ON TABLE public.home_visit_requests TO anon;

-- Authenticated UI: preserve only the operations confirmed by the direct
-- Supabase calls in current screens. Unused patient_visits access is revoked.
GRANT SELECT, INSERT, UPDATE ON TABLE
  public.appointments,
  public.calculator_settings,
  public.clinic_settings,
  public.profiles
TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.blog_posts,
  public.fitness_content,
  public.patients
TO authenticated;

-- Form rows can be created only from their public payload columns. Staff can
-- change only workflow status; RLS separately limits which rows they can see,
-- update, or delete.
GRANT INSERT (name, email, phone, message)
  ON TABLE public.contact_submissions TO authenticated;
GRANT INSERT (
  full_name, phone, address, maps_location, patient_age, medical_condition,
  preferred_date, preferred_time, report_url, notes
) ON TABLE public.home_visit_requests TO authenticated;
GRANT SELECT, DELETE ON TABLE
  public.contact_submissions,
  public.home_visit_requests
TO authenticated;
GRANT UPDATE (status) ON TABLE
  public.contact_submissions,
  public.home_visit_requests
TO authenticated;

-- The browser reads its own role; role assignment/removal stays server-side via
-- service_role in admin.functions.ts. No authenticated DML on user_roles.
GRANT SELECT ON TABLE public.user_roles TO authenticated;

-- Revoke future broad defaults only within public. Global defaults are rejected
-- by preflight because they would affect other schemas. service_role defaults
-- and non-public schema defaults are untouched.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated;

-- Role helpers are required by authenticated RLS and server-side admin APIs;
-- anon does not call them. Retain service_role execution.
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid), public.is_admin(uuid)
  TO authenticated, service_role;

-- Support any deployed has_role(uuid, ...) overload without assuming the local
-- repository migration history exactly matches the live catalog.
DO $role_helpers$
DECLARE
  helper_signature regprocedure;
BEGIN
  FOR helper_signature IN
    SELECT p.oid::regprocedure
    FROM pg_proc AS p
    JOIN pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'has_role'
      AND p.pronargs = 2
      AND format_type(p.proargtypes[0], NULL) = 'uuid'
  LOOP
    EXECUTE format(
      'REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon',
      helper_signature
    );
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role',
      helper_signature
    );
  END LOOP;
END;
$role_helpers$;

COMMIT;
