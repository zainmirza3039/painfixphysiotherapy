\set ON_ERROR_STOP on
-- Disposable integration database bootstrap. Run as postgres with the migration available.
DO $$
BEGIN
  IF current_database() !~ '^painfix_internship_test_[a-z0-9_]+$' THEN
    RAISE EXCEPTION 'refusing internship fixture bootstrap outside painfix_internship_test_*: %', current_database();
  END IF;
  IF to_regclass('auth.users') IS NOT NULL OR to_regclass('public.user_roles') IS NOT NULL THEN
    RAISE EXCEPTION 'bootstrap requires a newly created empty test database; existing data will not be reset';
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY, email text UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.user_roles (user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role text NOT NULL CHECK (role IN ('admin','super_admin')), PRIMARY KEY (user_id, role));
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin')) $$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
GRANT SELECT ON auth.users, public.user_roles TO service_role;
-- Deliberately mimic unsafe Supabase defaults: migration must revoke these.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
INSERT INTO auth.users(id, email) VALUES
 ('00000000-0000-0000-0000-000000000001','admin@example.test'),
 ('00000000-0000-0000-0000-000000000002','super@example.test'),
 ('00000000-0000-0000-0000-000000000003','user@example.test');
INSERT INTO public.user_roles VALUES
 ('00000000-0000-0000-0000-000000000001','admin'),
 ('00000000-0000-0000-0000-000000000002','super_admin');
\ir ../supabase/migrations/20261021000000_internship_certificates.sql
