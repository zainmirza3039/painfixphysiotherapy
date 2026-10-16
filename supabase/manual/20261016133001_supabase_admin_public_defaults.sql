-- OWNER-AUTHORIZED STEP — intentionally outside supabase/migrations.
-- Execute this only through a connection whose current_user is supabase_admin
-- or a role authorized to alter supabase_admin's defaults. The normal project
-- migration runner was observed as postgres, which is not a member of
-- supabase_admin; it must not attempt these statements.
--
-- This step is limited to supabase_admin-created objects in schema public.
-- It does not change defaults in graphql, graphql_public, storage, extensions,
-- or any other schema. It refuses global ACLs because those affect all schemas.
-- Run only after a current recoverable backup and scoped approval are confirmed.

BEGIN;

DO $preflight$
DECLARE
  anon_role oid;
  authenticated_role oid;
BEGIN
  IF to_regrole('supabase_admin') IS NULL
     OR to_regrole('anon') IS NULL
     OR to_regrole('authenticated') IS NULL THEN
    RAISE EXCEPTION 'Required Supabase roles are missing; no changes made';
  END IF;

  IF NOT pg_has_role(current_user, 'supabase_admin', 'MEMBER') THEN
    RAISE EXCEPTION
      'This step must run as supabase_admin or an authorized member; current_user=%',
      current_user;
  END IF;

  anon_role := (SELECT oid FROM pg_roles WHERE rolname = 'anon');
  authenticated_role := (SELECT oid FROM pg_roles WHERE rolname = 'authenticated');

  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclobjtype IN ('r', 'S')
      AND d.defaclnamespace = 0
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
  ) THEN
    RAISE EXCEPTION
      'Global table/sequence defaults exist; review their all-schema impact before changing any defaults';
  END IF;

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
END;
$preflight$;

-- Global defaults are not touched. These schema-specific revokes are the
-- narrowest safe change for the verified supabase_admin ACLs in public.
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, anon, authenticated;

DO $verify$
DECLARE
  anon_role oid := (SELECT oid FROM pg_roles WHERE rolname = 'anon');
  authenticated_role oid := (SELECT oid FROM pg_roles WHERE rolname = 'authenticated');
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_default_acl AS d
    CROSS JOIN LATERAL aclexplode(d.defaclacl) AS acl
    WHERE d.defaclrole = 'supabase_admin'::regrole
      AND d.defaclnamespace = 'public'::regnamespace
      AND d.defaclobjtype IN ('r', 'S')
      AND (acl.grantee = 0 OR acl.grantee IN (anon_role, authenticated_role))
  ) THEN
    RAISE EXCEPTION 'supabase_admin public-schema defaults remain broad';
  END IF;
END;
$verify$;

COMMIT;
