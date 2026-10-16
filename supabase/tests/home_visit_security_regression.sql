-- Run only against a disposable local Supabase database after both the
-- supabase_admin owner step and the migration have completed. This script
-- inserts synthetic users and requests, exercises RLS, and ends with ROLLBACK.
-- Never run against production or a database containing real test subjects.

BEGIN;

DO $acl_regression$
DECLARE
  anon_role oid;
  authenticated_role oid;
  table_row record;
BEGIN
  IF to_regclass('public.home_visit_requests') IS NULL
     OR to_regclass('public.contact_submissions') IS NULL THEN
    RAISE EXCEPTION 'Expected existing submission tables are missing';
  END IF;

  anon_role := (SELECT oid FROM pg_roles WHERE rolname = 'anon');
  authenticated_role := (SELECT oid FROM pg_roles WHERE rolname = 'authenticated');

  IF anon_role IS NULL OR authenticated_role IS NULL THEN
    RAISE EXCEPTION 'Supabase client roles are missing';
  END IF;

  -- Assert the exact reviewed public relation inventory: eleven ordinary
  -- application tables, with no additional relations or public sequences.
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
      'Public relation inventory differs from the reviewed regression set';
  END IF;

  IF NOT has_schema_privilege('anon', 'public', 'USAGE')
     OR NOT has_schema_privilege('authenticated', 'public', 'USAGE')
     OR has_schema_privilege('anon', 'public', 'CREATE')
     OR has_schema_privilege('authenticated', 'public', 'CREATE') THEN
    RAISE EXCEPTION 'Unexpected public schema privileges';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_auth_members
    WHERE member IN (anon_role, authenticated_role)
  ) THEN
    RAISE EXCEPTION 'anon/authenticated unexpectedly inherit another role';
  END IF;

  -- No explicit PUBLIC relation ACL may bypass the named-role grant matrix.
  IF EXISTS (
    SELECT 1
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(c.relacl) AS acl
    WHERE n.nspname = 'public'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f', 'S')
      AND acl.grantee = 0
  ) THEN
    RAISE EXCEPTION 'PUBLIC retains a direct privilege on a public relation/sequence';
  END IF;

  -- Inspect both global defaults and schema-specific public defaults. The
  -- global check matters because an IN SCHEMA revoke cannot undo a global grant.
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclobjtype IN ('r', 'S')
      AND (d.defaclnamespace = 0 OR d.defaclnamespace = 'public'::regnamespace)
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
  ) THEN
    RAISE EXCEPTION 'Global or public-schema defaults still grant PUBLIC/anon/authenticated';
  END IF;

  -- Assert an exact table-privilege matrix, not merely the absence of TRUNCATE.
  -- In particular, appointments has no DELETE grant, unused patient_visits has
  -- no browser grant, and anon has no content reads outside current public UI.
  IF EXISTS (
    WITH expected(role_name, table_name, allowed) AS (
      VALUES
        ('anon', 'appointments', ARRAY[]::text[]),
        ('anon', 'blog_posts', ARRAY['SELECT']::text[]),
        ('anon', 'calculator_settings', ARRAY[]::text[]),
        ('anon', 'clinic_settings', ARRAY[]::text[]),
        ('anon', 'contact_submissions', ARRAY[]::text[]),
        ('anon', 'fitness_content', ARRAY[]::text[]),
        ('anon', 'home_visit_requests', ARRAY[]::text[]),
        ('anon', 'patient_visits', ARRAY[]::text[]),
        ('anon', 'patients', ARRAY[]::text[]),
        ('anon', 'profiles', ARRAY['SELECT']::text[]),
        ('anon', 'user_roles', ARRAY[]::text[]),
        ('authenticated', 'appointments', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('authenticated', 'blog_posts', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[]),
        ('authenticated', 'calculator_settings', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('authenticated', 'clinic_settings', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('authenticated', 'contact_submissions', ARRAY['SELECT', 'DELETE']::text[]),
        ('authenticated', 'fitness_content', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[]),
        ('authenticated', 'home_visit_requests', ARRAY['SELECT', 'DELETE']::text[]),
        ('authenticated', 'patient_visits', ARRAY[]::text[]),
        ('authenticated', 'patients', ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']::text[]),
        ('authenticated', 'profiles', ARRAY['SELECT', 'INSERT', 'UPDATE']::text[]),
        ('authenticated', 'user_roles', ARRAY['SELECT']::text[])
    ), privileges(privilege_name) AS (
      SELECT privilege_name
      FROM (VALUES
        ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
        ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
      ) AS common(privilege_name)
      UNION ALL
      SELECT 'MAINTAIN'
      WHERE current_setting('server_version_num')::integer >= 170000
    )
    SELECT 1
    FROM expected AS e
    CROSS JOIN privileges AS p
    WHERE has_table_privilege(
      e.role_name,
      format('public.%I', e.table_name),
      p.privilege_name
    ) IS DISTINCT FROM (p.privilege_name = ANY(e.allowed))
  ) THEN
    RAISE EXCEPTION 'anon/authenticated table ACLs differ from the approved UI matrix';
  END IF;

  -- Forms receive INSERT only on submitted fields; authenticated workflow
  -- updates are limited to status. Check every live column, including extras.
  IF EXISTS (
    WITH roles(role_name, table_name) AS (
      VALUES
        ('anon', 'contact_submissions'),
        ('authenticated', 'contact_submissions'),
        ('anon', 'home_visit_requests'),
        ('authenticated', 'home_visit_requests')
    ), allowed(role_name, table_name, column_name) AS (
      VALUES
        ('anon', 'contact_submissions', 'name'),
        ('anon', 'contact_submissions', 'email'),
        ('anon', 'contact_submissions', 'phone'),
        ('anon', 'contact_submissions', 'message'),
        ('authenticated', 'contact_submissions', 'name'),
        ('authenticated', 'contact_submissions', 'email'),
        ('authenticated', 'contact_submissions', 'phone'),
        ('authenticated', 'contact_submissions', 'message'),
        ('anon', 'home_visit_requests', 'full_name'),
        ('anon', 'home_visit_requests', 'phone'),
        ('anon', 'home_visit_requests', 'address'),
        ('anon', 'home_visit_requests', 'maps_location'),
        ('anon', 'home_visit_requests', 'patient_age'),
        ('anon', 'home_visit_requests', 'medical_condition'),
        ('anon', 'home_visit_requests', 'preferred_date'),
        ('anon', 'home_visit_requests', 'preferred_time'),
        ('anon', 'home_visit_requests', 'report_url'),
        ('anon', 'home_visit_requests', 'notes'),
        ('authenticated', 'home_visit_requests', 'full_name'),
        ('authenticated', 'home_visit_requests', 'phone'),
        ('authenticated', 'home_visit_requests', 'address'),
        ('authenticated', 'home_visit_requests', 'maps_location'),
        ('authenticated', 'home_visit_requests', 'patient_age'),
        ('authenticated', 'home_visit_requests', 'medical_condition'),
        ('authenticated', 'home_visit_requests', 'preferred_date'),
        ('authenticated', 'home_visit_requests', 'preferred_time'),
        ('authenticated', 'home_visit_requests', 'report_url'),
        ('authenticated', 'home_visit_requests', 'notes')
    )
    SELECT 1
    FROM roles AS r
    JOIN pg_class AS c
      ON c.oid = to_regclass(format('public.%I', r.table_name))
    JOIN pg_attribute AS a
      ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE has_column_privilege(r.role_name, a.attrelid, a.attnum, 'INSERT')
      IS DISTINCT FROM (
        EXISTS (
          SELECT 1 FROM allowed AS x
          WHERE x.role_name = r.role_name
            AND x.table_name = r.table_name
            AND x.column_name = a.attname
        )
      )
  ) THEN
    RAISE EXCEPTION 'Form INSERT column privileges differ from the approved payload matrix';
  END IF;

  IF EXISTS (
    WITH role_tables(role_name, table_name) AS (
      VALUES
        ('authenticated', 'contact_submissions'),
        ('authenticated', 'home_visit_requests')
    )
    SELECT 1
    FROM role_tables AS r
    JOIN pg_class AS c
      ON c.oid = to_regclass(format('public.%I', r.table_name))
    JOIN pg_attribute AS a
      ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
    WHERE has_column_privilege(r.role_name, a.attrelid, a.attnum, 'UPDATE')
      IS DISTINCT FROM (a.attname = 'status')
  ) THEN
    RAISE EXCEPTION 'Authenticated UPDATE must be limited to status columns';
  END IF;

  -- Future/existing public sequences are not part of any browser workflow.
  FOR table_row IN
    SELECT c.oid, c.relname
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'S'
  LOOP
    IF has_sequence_privilege('anon', table_row.oid, 'USAGE')
       OR has_sequence_privilege('anon', table_row.oid, 'SELECT')
       OR has_sequence_privilege('anon', table_row.oid, 'UPDATE')
       OR has_sequence_privilege('authenticated', table_row.oid, 'USAGE')
       OR has_sequence_privilege('authenticated', table_row.oid, 'SELECT')
       OR has_sequence_privilege('authenticated', table_row.oid, 'UPDATE') THEN
      RAISE EXCEPTION 'Browser role retains a sequence privilege on public.%', table_row.relname;
    END IF;
  END LOOP;

  IF NOT has_table_privilege('service_role', 'public.home_visit_requests', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'DELETE')
     OR NOT has_table_privilege('service_role', 'public.user_roles', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.user_roles', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.user_roles', 'DELETE') THEN
    RAISE EXCEPTION 'service_role backend/admin privileges were unexpectedly changed';
  END IF;

  IF NOT has_function_privilege('authenticated', 'public.is_staff(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.is_admin(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('service_role', 'public.has_role(uuid, text)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.is_staff(uuid)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.is_admin(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'Role-helper EXECUTE grants do not match their RLS/server dependencies';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.home_visit_requests'::regclass
      AND attname = 'status' AND NOT attisdropped
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_attribute
    WHERE attrelid = 'public.contact_submissions'::regclass
      AND attname = 'status' AND NOT attisdropped
  ) THEN
    RAISE EXCEPTION 'Admin status columns are missing';
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
    RAISE EXCEPTION 'RLS is disabled on an application table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'home_visit_requests'
      AND policyname = 'Staff can update home visit requests' AND cmd = 'UPDATE'
      AND qual LIKE '%is_staff%' AND with_check LIKE '%is_staff%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'home_visit_requests'
      AND policyname = 'Admins can delete home visit requests' AND cmd = 'DELETE'
      AND qual LIKE '%is_admin%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_submissions'
      AND policyname = 'Admins can update contact messages' AND cmd = 'UPDATE'
      AND qual LIKE '%is_admin%' AND with_check LIKE '%is_admin%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_submissions'
      AND policyname = 'Admins can delete contact messages' AND cmd = 'DELETE'
      AND qual LIKE '%is_admin%'
  ) THEN
    RAISE EXCEPTION 'Expected staff/admin RLS policies are missing or incorrectly scoped';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'home_visit_requests'
      AND policyname = 'Anyone can submit a home visit request' AND cmd = 'INSERT'
      AND with_check LIKE '%btrim%'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'contact_submissions'
      AND policyname = 'Anyone can submit a contact message' AND cmd = 'INSERT'
      AND with_check LIKE '%btrim%'
  ) THEN
    RAISE EXCEPTION 'Public form payload-validation policies are missing';
  END IF;
END;
$acl_regression$;

-- A valid anonymous Home Visit submission persists in the existing table. The
-- status default matches the admin list. No unrelated request data is read.
SELECT set_config('app.home_visit_security_test_marker', gen_random_uuid()::text, true);
SELECT set_config('app.contact_security_test_marker', gen_random_uuid()::text, true);
SELECT set_config('app.auth_home_visit_security_test_marker', 'auth-' || gen_random_uuid()::text, true);
SELECT set_config('app.auth_contact_security_test_marker', 'auth-' || gen_random_uuid()::text, true);
SET LOCAL ROLE anon;
INSERT INTO public.home_visit_requests (full_name, phone, address, medical_condition)
VALUES (
  current_setting('app.home_visit_security_test_marker'),
  '+923001234567',
  'Disposable local regression fixture',
  'Test request'
);
INSERT INTO public.contact_submissions (name, email, phone, message)
VALUES (
  current_setting('app.contact_security_test_marker'),
  'fixture@example.invalid',
  '+923001234567',
  'Disposable local regression fixture'
);
DO $anon_status_injection$
BEGIN
  BEGIN
    INSERT INTO public.home_visit_requests
      (full_name, phone, address, status)
    VALUES ('Status injection', '+923001234567', 'Disposable fixture', 'contacted');
  EXCEPTION WHEN insufficient_privilege THEN
    RETURN;
  END;
  RAISE EXCEPTION 'Anonymous user could assign an internal Home Visit status';
END;
$anon_status_injection$;
RESET ROLE;

-- The signed-in public form uses the same field-limited insert contract.
SET LOCAL ROLE authenticated;
INSERT INTO public.home_visit_requests (full_name, phone, address, medical_condition)
VALUES (
  current_setting('app.auth_home_visit_security_test_marker'),
  '+923001234568',
  'Disposable authenticated regression fixture',
  'Test request'
);
INSERT INTO public.contact_submissions (name, email, phone, message)
VALUES (
  current_setting('app.auth_contact_security_test_marker'),
  'authenticated-fixture@example.invalid',
  '+923001234568',
  'Disposable authenticated regression fixture'
);
DO $authenticated_status_injection$
BEGIN
  BEGIN
    INSERT INTO public.home_visit_requests
      (full_name, phone, address, status)
    VALUES ('Authenticated status injection', '+923001234567', 'Disposable fixture', 'contacted');
  EXCEPTION WHEN insufficient_privilege THEN
    RETURN;
  END;
  RAISE EXCEPTION 'Authenticated user could assign an internal Home Visit status';
END;
$authenticated_status_injection$;
RESET ROLE;

DO $public_persistence$
DECLARE
  visit_count integer;
  contact_count integer;
  visit_status text;
BEGIN
  SELECT count(*), max(status) INTO visit_count, visit_status
  FROM public.home_visit_requests
  WHERE full_name IN (
    current_setting('app.home_visit_security_test_marker'),
    current_setting('app.auth_home_visit_security_test_marker')
  );
  SELECT count(*) INTO contact_count
  FROM public.contact_submissions
  WHERE name IN (
    current_setting('app.contact_security_test_marker'),
    current_setting('app.auth_contact_security_test_marker')
  );

  IF visit_count <> 2 OR visit_status <> 'new' THEN
    RAISE EXCEPTION 'Valid Home Visit inserts did not persist with their default status';
  END IF;
  IF contact_count <> 2 THEN
    RAISE EXCEPTION 'Valid anonymous/authenticated contact inserts did not persist';
  END IF;
END;
$public_persistence$;

-- Table-level grants deny anonymous reads; the INSERT policy separately
-- rejects malformed form payloads.
SET LOCAL ROLE anon;
DO $anon_denials$
BEGIN
  BEGIN
    PERFORM count(*) FROM public.home_visit_requests;
  EXCEPTION WHEN insufficient_privilege THEN
    RETURN;
  END;
  RAISE EXCEPTION 'anon can read Home Visit requests';
END;
$anon_denials$;

DO $invalid_home_visit$
BEGIN
  BEGIN
    INSERT INTO public.home_visit_requests (full_name, phone, address)
    VALUES ('   ', '1234567', 'Disposable invalid regression fixture');
  EXCEPTION WHEN insufficient_privilege THEN
    RETURN;
  END;
  RAISE EXCEPTION 'Invalid blank Home Visit submission was accepted';
END;
$invalid_home_visit$;
RESET ROLE;

-- Synthetic identities and workflow rows exist only inside this transaction.
SELECT set_config('app.test_staff_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_admin_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_nonstaff_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_staff_visit_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_admin_visit_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_nonstaff_visit_id', gen_random_uuid()::text, true);
SELECT set_config('app.test_admin_contact_id', gen_random_uuid()::text, true);

INSERT INTO auth.users (id, aud, role, email, created_at, updated_at, is_sso_user, is_anonymous)
VALUES
  (current_setting('app.test_staff_id')::uuid, 'authenticated', 'authenticated', 'staff-' || current_setting('app.test_staff_id') || '@example.invalid', now(), now(), false, false),
  (current_setting('app.test_admin_id')::uuid, 'authenticated', 'authenticated', 'admin-' || current_setting('app.test_admin_id') || '@example.invalid', now(), now(), false, false),
  (current_setting('app.test_nonstaff_id')::uuid, 'authenticated', 'authenticated', 'nonstaff-' || current_setting('app.test_nonstaff_id') || '@example.invalid', now(), now(), false, false);

INSERT INTO public.user_roles (user_id, role)
VALUES
  (current_setting('app.test_staff_id')::uuid, 'staff'),
  (current_setting('app.test_admin_id')::uuid, 'admin');

INSERT INTO public.home_visit_requests (id, full_name, phone, address, status)
VALUES
  (current_setting('app.test_staff_visit_id')::uuid, 'Disposable staff request', '+923001234567', 'Fixture address', 'new'),
  (current_setting('app.test_admin_visit_id')::uuid, 'Disposable admin request', '+923001234567', 'Fixture address', 'new'),
  (current_setting('app.test_nonstaff_visit_id')::uuid, 'Disposable nonstaff request', '+923001234567', 'Fixture address', 'new');

INSERT INTO public.contact_submissions (id, name, email, message, status)
VALUES (
  current_setting('app.test_admin_contact_id')::uuid,
  'Disposable admin message',
  'admin-message@example.invalid',
  'Fixture message',
  'new'
);

-- Staff can read/update Home Visit requests, but cannot delete requests or
-- change/delete contact messages that the Messages screen reserves for admins.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('app.test_staff_id'), true);
DO $staff_behavior$
DECLARE
  affected integer;
  visible integer;
BEGIN
  SELECT count(*) INTO visible
  FROM public.home_visit_requests
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  IF visible <> 1 THEN RAISE EXCEPTION 'Staff cannot read Home Visit requests'; END IF;

  UPDATE public.home_visit_requests
  SET status = 'staff-reviewed'
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Staff status update was denied'; END IF;

  BEGIN
    UPDATE public.home_visit_requests SET notes = 'not an allowed staff update'
    WHERE id = current_setting('app.test_staff_visit_id')::uuid;
    RAISE EXCEPTION 'Staff changed a non-status Home Visit column';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  DELETE FROM public.home_visit_requests
  WHERE id = current_setting('app.test_admin_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Staff deleted an admin-only Home Visit request'; END IF;

  SELECT count(*) INTO visible
  FROM public.contact_submissions
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  IF visible <> 1 THEN RAISE EXCEPTION 'Staff cannot read contact messages'; END IF;

  UPDATE public.contact_submissions SET status = 'staff-changed'
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Staff changed an admin-only contact message'; END IF;

  DELETE FROM public.contact_submissions
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Staff deleted an admin-only contact message'; END IF;
END;
$staff_behavior$;
RESET ROLE;

-- A logged-in user without a staff/admin role has table-level DML grants for
-- shared UI roles, but RLS must prevent reading or changing other records.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('app.test_nonstaff_id'), true);
DO $nonstaff_behavior$
DECLARE
  affected integer;
  visible integer;
BEGIN
  SELECT count(*) INTO visible
  FROM public.home_visit_requests
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  IF visible <> 0 THEN RAISE EXCEPTION 'Nonstaff user can read a Home Visit request'; END IF;

  UPDATE public.home_visit_requests SET status = 'unauthorized'
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Nonstaff user updated a Home Visit request'; END IF;

  DELETE FROM public.home_visit_requests
  WHERE id = current_setting('app.test_admin_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Nonstaff user deleted a Home Visit request'; END IF;

  UPDATE public.contact_submissions SET status = 'unauthorized'
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Nonstaff user updated a contact message'; END IF;

  DELETE FROM public.contact_submissions
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Nonstaff user deleted a contact message'; END IF;
END;
$nonstaff_behavior$;
RESET ROLE;

-- Admin is_staff access permits status updates; is_admin gates deletes and
-- contact changes. These tests exercise real policies, not policy-name checks.
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('app.test_admin_id'), true);
DO $admin_behavior$
DECLARE
  affected integer;
BEGIN
  UPDATE public.home_visit_requests SET status = 'admin-reviewed'
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Admin Home Visit status update was denied'; END IF;

  DELETE FROM public.home_visit_requests
  WHERE id = current_setting('app.test_admin_visit_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Admin Home Visit delete was denied'; END IF;

  UPDATE public.contact_submissions SET status = 'resolved'
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Admin contact status update was denied'; END IF;

  DELETE FROM public.contact_submissions
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Admin contact delete was denied'; END IF;
END;
$admin_behavior$;
RESET ROLE;

DO $final_state$
DECLARE
  row_status text;
  row_count integer;
BEGIN
  SELECT status INTO row_status FROM public.home_visit_requests
  WHERE id = current_setting('app.test_staff_visit_id')::uuid;
  IF row_status <> 'admin-reviewed' THEN
    RAISE EXCEPTION 'Authorized staff/admin updates did not persist in the transaction';
  END IF;

  SELECT count(*) INTO row_count FROM public.home_visit_requests
  WHERE id = current_setting('app.test_admin_visit_id')::uuid;
  IF row_count <> 0 THEN RAISE EXCEPTION 'Admin delete did not persist in the transaction'; END IF;

  SELECT status INTO row_status FROM public.home_visit_requests
  WHERE id = current_setting('app.test_nonstaff_visit_id')::uuid;
  IF row_status <> 'new' THEN RAISE EXCEPTION 'Denied nonstaff update changed a request'; END IF;

  SELECT count(*) INTO row_count FROM public.contact_submissions
  WHERE id = current_setting('app.test_admin_contact_id')::uuid;
  IF row_count <> 0 THEN RAISE EXCEPTION 'Admin contact delete did not persist in the transaction'; END IF;
END;
$final_state$;

-- Remove every synthetic user/request/message; nothing from this test commits.
ROLLBACK;
