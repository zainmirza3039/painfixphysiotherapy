-- Disposable PostgreSQL database only. Run as a superuser in a new, empty local DB:
--   psql -v ON_ERROR_STOP=1 -d painfix_home_visit_security_test -f tests/sql/home_visit_requests_security.sql
-- This creates synthetic roles and public/auth objects. It intentionally fails at
-- CREATE ROLE if pointed at a Supabase database that already has these roles.
\set ON_ERROR_STOP on

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

CREATE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;

CREATE TABLE public.user_roles (
  user_id uuid NOT NULL,
  role text NOT NULL,
  PRIMARY KEY (user_id, role)
);
GRANT SELECT ON public.user_roles TO anon, authenticated;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
) $$;
CREATE FUNCTION public.is_staff(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = _user_id AND role IN ('admin', 'super_admin', 'staff')
) $$;

CREATE TABLE public.home_visit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  maps_location text,
  patient_age integer,
  medical_condition text,
  preferred_date date,
  preferred_time text,
  report_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL PRIVILEGES ON TABLE public.home_visit_requests TO anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.home_visit_requests TO service_role;
ALTER TABLE public.home_visit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a home visit request"
  ON public.home_visit_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read home visit requests"
  ON public.home_visit_requests FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- A synthetic pre-migration request verifies existing rows survive the additive migration.
INSERT INTO public.home_visit_requests (full_name, phone, address, medical_condition)
VALUES ('Existing synthetic row', '03000000000', 'Test address', 'Test only');

\ir ../../supabase/migrations/20261016084500_harden_home_visit_requests.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'home_visit_requests'
      AND column_name = 'status' AND is_nullable = 'NO'
  ) THEN RAISE EXCEPTION 'status column missing or nullable'; END IF;
  IF (SELECT status FROM public.home_visit_requests WHERE full_name = 'Existing synthetic row') <> 'new'
  THEN RAISE EXCEPTION 'existing row not preserved with default status'; END IF;

  IF has_table_privilege('anon', 'public.home_visit_requests', 'INSERT')
     OR NOT has_column_privilege('anon', 'public.home_visit_requests', 'full_name', 'INSERT')
     OR NOT has_column_privilege('anon', 'public.home_visit_requests', 'phone', 'INSERT')
     OR NOT has_column_privilege('anon', 'public.home_visit_requests', 'medical_condition', 'INSERT')
     OR has_column_privilege('anon', 'public.home_visit_requests', 'status', 'INSERT')
     OR has_column_privilege('anon', 'public.home_visit_requests', 'id', 'INSERT')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'SELECT')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'UPDATE')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'DELETE')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'REFERENCES')
     OR has_table_privilege('anon', 'public.home_visit_requests', 'TRIGGER')
  THEN RAISE EXCEPTION 'anonymous privilege set is not least-privilege'; END IF;

  IF NOT has_table_privilege('authenticated', 'public.home_visit_requests', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.home_visit_requests', 'DELETE')
     OR has_table_privilege('authenticated', 'public.home_visit_requests', 'INSERT')
     OR has_table_privilege('authenticated', 'public.home_visit_requests', 'UPDATE')
     OR NOT has_column_privilege('authenticated', 'public.home_visit_requests', 'full_name', 'INSERT')
     OR NOT has_column_privilege('authenticated', 'public.home_visit_requests', 'notes', 'INSERT')
     OR has_column_privilege('authenticated', 'public.home_visit_requests', 'status', 'INSERT')
     OR NOT has_column_privilege('authenticated', 'public.home_visit_requests', 'status', 'UPDATE')
     OR has_column_privilege('authenticated', 'public.home_visit_requests', 'notes', 'UPDATE')
     OR has_table_privilege('authenticated', 'public.home_visit_requests', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.home_visit_requests', 'REFERENCES')
     OR has_table_privilege('authenticated', 'public.home_visit_requests', 'TRIGGER')
  THEN RAISE EXCEPTION 'authenticated privilege set is not least-privilege'; END IF;

  IF current_setting('server_version_num')::integer >= 170000 THEN
    IF has_table_privilege('anon', 'public.home_visit_requests', 'MAINTAIN')
       OR has_table_privilege('authenticated', 'public.home_visit_requests', 'MAINTAIN')
    THEN RAISE EXCEPTION 'MAINTAIN privilege unexpectedly remains'; END IF;
  END IF;

  IF NOT has_table_privilege('service_role', 'public.home_visit_requests', 'SELECT')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'INSERT')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'UPDATE')
     OR NOT has_table_privilege('service_role', 'public.home_visit_requests', 'DELETE')
  THEN RAISE EXCEPTION 'service_role access was unexpectedly changed'; END IF;

  IF has_function_privilege('anon', 'public.has_role(uuid,text)', 'EXECUTE')
     OR has_function_privilege('anon', 'public.is_staff(uuid)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.has_role(uuid,text)', 'EXECUTE')
     OR NOT has_function_privilege('authenticated', 'public.is_staff(uuid)', 'EXECUTE')
  THEN RAISE EXCEPTION 'role-helper execute privileges are incorrect'; END IF;
END $$;

-- Anonymous users can create a valid request and the row persists.
SET ROLE anon;
INSERT INTO public.home_visit_requests
  (full_name, phone, address, medical_condition, preferred_date, preferred_time)
VALUES
  ('Synthetic QA request', '+92 300 0000000', 'Test address', 'Test only', current_date + 1, '10:30');

-- Invalid blank input must be rejected by the INSERT policy.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.home_visit_requests
      (full_name, phone, address, medical_condition, preferred_date, preferred_time)
    VALUES ('   ', '03000000000', 'Test address', 'Test condition', current_date + 1, '10:00');
    RAISE EXCEPTION 'blank anonymous input unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN
    INSERT INTO public.home_visit_requests
      (full_name, phone, address, medical_condition, preferred_date, preferred_time)
    VALUES ('Missing condition', '03000000000', 'Test address', NULL, current_date + 1, '10:00');
    RAISE EXCEPTION 'missing required condition unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  BEGIN
    INSERT INTO public.home_visit_requests
      (full_name, phone, address, medical_condition, preferred_date, preferred_time, status)
    VALUES ('Status injection', '03000000000', 'Test address', 'Test condition', current_date + 1, '10:00', 'contacted');
    RAISE EXCEPTION 'anonymous status assignment unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;

-- All direct row reads/writes and TRUNCATE must fail for anon; no production data involved.
DO $$
BEGIN
  BEGIN EXECUTE 'SELECT count(*) FROM public.home_visit_requests';
    RAISE EXCEPTION 'anonymous SELECT unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN EXECUTE 'UPDATE public.home_visit_requests SET notes = ''x''';
    RAISE EXCEPTION 'anonymous UPDATE unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN EXECUTE 'DELETE FROM public.home_visit_requests';
    RAISE EXCEPTION 'anonymous DELETE unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN EXECUTE 'TRUNCATE public.home_visit_requests';
    RAISE EXCEPTION 'anonymous TRUNCATE unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.home_visit_requests WHERE full_name = 'Synthetic QA request') <> 1
  THEN RAISE EXCEPTION 'anonymous INSERT did not persist'; END IF;
END $$;

-- Authenticated non-staff users must not read or modify existing requests.
SET ROLE authenticated;
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000099';
DO $$
DECLARE affected integer;
BEGIN
  IF (SELECT count(*) FROM public.home_visit_requests) <> 0
  THEN RAISE EXCEPTION 'non-staff authenticated user unexpectedly read requests'; END IF;
  UPDATE public.home_visit_requests SET status = 'contacted';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'non-staff authenticated user unexpectedly updated requests'; END IF;
  BEGIN
    UPDATE public.home_visit_requests SET notes = 'not an allowed update';
    RAISE EXCEPTION 'authenticated user unexpectedly updated a non-status column';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  DELETE FROM public.home_visit_requests;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'non-staff authenticated user unexpectedly deleted requests'; END IF;
END $$;
RESET ROLE;

-- Authenticated users retain the public form’s insert path.
SET ROLE authenticated;
INSERT INTO public.home_visit_requests
  (full_name, phone, address, medical_condition, preferred_date, preferred_time)
VALUES
  ('Authenticated QA request', '+92 300 0000001', 'Test address', 'Test only', current_date + 1, '11:00');
RESET ROLE;

INSERT INTO public.user_roles (user_id, role) VALUES
  ('10000000-0000-0000-0000-000000000001', 'staff'),
  ('10000000-0000-0000-0000-000000000002', 'admin'),
  ('10000000-0000-0000-0000-000000000003', 'super_admin');

-- Staff can read and update status, but cannot delete.
SET ROLE authenticated;
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000001';
DO $$
DECLARE affected integer;
BEGIN
  IF (SELECT count(*) FROM public.home_visit_requests) <> 3
  THEN RAISE EXCEPTION 'staff cannot read Home Visit requests'; END IF;
  UPDATE public.home_visit_requests SET status = 'contacted'
    WHERE full_name = 'Synthetic QA request';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'staff status update failed'; END IF;
  DELETE FROM public.home_visit_requests WHERE full_name = 'Synthetic QA request';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'staff unexpectedly deleted a request'; END IF;
END $$;
RESET ROLE;

-- Admin and super_admin can delete their respective synthetic QA rows.
SET ROLE authenticated;
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000002';
DELETE FROM public.home_visit_requests WHERE full_name = 'Authenticated QA request';
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claim.sub = '10000000-0000-0000-0000-000000000003';
DELETE FROM public.home_visit_requests WHERE full_name = 'Synthetic QA request';
RESET ROLE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.home_visit_requests WHERE full_name IN ('Synthetic QA request', 'Authenticated QA request'))
  THEN RAISE EXCEPTION 'admin/super_admin delete failed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.home_visit_requests WHERE full_name = 'Existing synthetic row')
  THEN RAISE EXCEPTION 'pre-existing request was lost'; END IF;
END $$;

SELECT 'PASS: anonymous and authenticated request persistence, least privilege, non-staff isolation, staff status updates, admin/super-admin deletion, and existing-row preservation' AS result;
