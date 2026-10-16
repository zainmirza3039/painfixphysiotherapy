# Home Visit functionality and database security fix

## Scope and production boundary

This change reuses the existing `public.home_visit_requests` table and Supabase API. It creates no duplicate table, endpoint, or notification service. The Home Visit form retains its existing request flow and now has explicit validation plus a synchronous single-flight submission guard.

**No production changes were made.** Live Supabase work was catalog-only: no request/patient rows were read, and there were no production inserts, DDL, ACL updates, deployments, or form submissions. The concurrent homepage/form worktree was left unchanged. This branch is not deployed.

## Live security findings

- `anon` and `authenticated` had broad direct privileges on all 11 public application tables, including `TRUNCATE`, `REFERENCES`, `TRIGGER`, and `MAINTAIN`.
- `anon` and `authenticated` are not members of other roles; `PUBLIC` has no direct table/view/sequence ACL entries. The roles can `SET ROLE` to their expected client roles from the current `postgres` connection.
- The `postgres` role is **not a superuser** in this project, owns the 11 application tables and the `is_staff`, `is_admin`, and `has_role` helpers, and is **not a member of `supabase_admin`**. It cannot safely alter `supabase_admin` default ACLs.
- There are no global table/sequence default ACLs and no public sequences. Schema-specific public defaults under both `postgres` and `supabase_admin` grant broad access to future tables/sequences. Public schema `USAGE` is present and required; `anon`/`authenticated` do not have `CREATE` there.
- RLS is enabled on every application table reviewed. The role helpers are invoker-security functions. Existing public form INSERT policies allowed any payload (`WITH CHECK (true)`); Home Visit had staff read access but no staff update/admin delete policies. The admin screens use `status` on Home Visit/contact rows although those columns were absent in the live schema.

## Implemented changes

### Home Visit form

- Added pure client validation for required nonblank name/phone/address, integer patient ages from 0–120, and the same field-length bounds enforced by the database policy. The relevant fields now also have matching browser `maxLength` constraints.
- Extracted payload normalization: trims user-entered strings, maps blank optional values to `null`, preserves age `0`, and sends the generated report-storage path.
- Added a synchronous single-flight gate. Unlike the former state-only disabled button, the gate closes before the lazy Supabase import or any other asynchronous operation, so overlapping submit events issue at most one insert. The gate releases on success and error, allowing a retry.
- Success/error outcomes remain explicit: successful inserts show the existing success toast and clear the form/file; upload or insert failures show the existing error toast and preserve the entered data. Age and length validation messages are localized in English and Urdu.

### Database migration and grants

The main migration is idempotent and guarded by preconditions. It aborts before changes if owners, RLS, table columns, role inheritance, schema access, helper ownership, or default ACL scope differ from the reviewed assumptions.

- Adds `status text NOT NULL DEFAULT 'new'` to the existing Home Visit and contact tables, normalizing only preexisting NULL status values.
- Replaces public INSERT checks with bounded, trimmed-field validation; adds staff Home Visit status-update and admin-only Home Visit delete/contact update/contact delete policies. Existing RLS remains enabled.
- Removes all direct table/sequence privileges from `PUBLIC`, `anon`, and `authenticated` in `public`, then grants the following exact UI matrix. RLS remains the row-level authorization boundary.

| Table | `anon` | `authenticated` |
|---|---|---|
| `appointments` | None | SELECT, INSERT, UPDATE |
| `blog_posts` | SELECT | SELECT, INSERT, UPDATE, DELETE |
| `calculator_settings` | None | SELECT, INSERT, UPDATE |
| `clinic_settings` | None | SELECT, INSERT, UPDATE |
| `contact_submissions` | INSERT (`name`, `email`, `phone`, `message`) | SELECT, INSERT (same form columns), UPDATE (`status`), DELETE |
| `fitness_content` | None | SELECT, INSERT, UPDATE, DELETE |
| `home_visit_requests` | INSERT (`full_name`, `phone`, `address`, `maps_location`, `patient_age`, `medical_condition`, `preferred_date`, `preferred_time`, `report_url`, `notes`) | SELECT, INSERT (same form columns), UPDATE (`status`), DELETE |
| `patient_visits` | None | None |
| `patients` | None | SELECT, INSERT, UPDATE, DELETE |
| `profiles` | SELECT | SELECT, INSERT, UPDATE |
| `user_roles` | None | SELECT |

For the two form tables, `anon` and `authenticated` have **column-level** INSERT only for submitted form fields; they cannot set `id`, `status`, or `created_at`. `authenticated` has column-level UPDATE only on `status`, while RLS limits which rows each staff/admin role can see or change. There is no relation-wide INSERT or UPDATE grant for these form tables. Anonymous content SELECT is limited to `blog_posts` and `profiles`, the only such direct reads used by the current public frontend. Public RLS policies for calculator/fitness tables remain, but without table grants they do not make those tables queryable by anonymous users. `authenticated` has no `user_roles` DML; role administration remains on the existing server-side `service_role` path. Existing `service_role` grants are not revoked.

### Default-ACL authorization boundary

The migration in `supabase/migrations/` changes only public-schema defaults owned by `postgres`. It refuses global defaults because a schema-specific revoke cannot remove a global grant safely. The separate `supabase/manual/20261016133001_supabase_admin_public_defaults.sql` file contains the narrowly scoped `supabase_admin` public-schema table/sequence revokes and is **not** in the regular migrations directory. It preflights owner authorization and global scope, then verifies the result. The normal `postgres` migration runner must not attempt it; the main migration fails early until this owner-authorized step has been completed.

## Verification

- **14/14 frontend tests pass:** nine Home Visit tests cover required/age/length validation, payload normalization, upload/insert success and failure, validation rejection, overlapping duplicate suppression, and retry after failure; five existing tests cover report MIME/size/extension validation.
- **Production build passes** after installing the exact `bun.lock` dependencies with `bun install --frozen-lockfile`. The build reports existing deprecation notices for TanStack `inputValidator` and `vite-tsconfig-paths`; it completes successfully.
- Targeted ESLint passes for all changed application/test source. `npx tsc --noEmit` remains blocked by one error in the untouched `src/routes/__root.tsx:250` (`ErrorComponentProps.error` is `unknown`, while the existing component declares `Error`); no type-check errors were reported in changed files.
- **Disposable PostgreSQL 16 regression passes:** the owner step rejects an unauthorized role; the main migration refuses before the owner step and leaves schema/ACL state unchanged; the authorized owner step succeeds; the consolidated migration applies twice; and the rollback-only regression verifies exact table and column grants (form-only INSERT, status-only UPDATE), public/global default ACLs, direct PUBLIC grants, sequence access, schema access, service-role/helper preservation, anonymous/authenticated form persistence, status-injection rejection, and staff/admin/nonstaff RLS operations. All SQL checks ran against a fresh local disposable cluster with synthetic fixtures only; the regression ends with `ROLLBACK`.
- The public [Home Visit page](https://painfixphysiotherapy.com/home-visit) and [homepage](https://painfixphysiotherapy.com/) returned content during read-only checks. No real form submission was sent.
- No real notification integration was found/configured/tested. The website's “our team will contact you” copy is not evidence that notifications work.

## Remaining limits and rollout

Frontend tests exercise the shared validation/submission helper with mocked adapters; the SQL fixture proves insert persistence and policy behavior in a rollback transaction. Neither proves live PostgREST persistence or a real browser/database round trip. The duplicate guard suppresses **overlapping client submissions**; it does not add server-side idempotency for a later, separately initiated request.

Production deployment and production migration application are intentionally out of scope here. Any future rollout requires a current recoverable backup and scoped approval first. Only then may an authorized operator execute the separate `supabase_admin` default-ACL step, followed by the guarded migration through the authorized pipeline; verify live ACLs and perform controlled form/admin checks with approved test data. Do not apply historical migrations wholesale or restore broad public grants. If the migration fails, correct the precondition and rerun transactionally; after a successful rollout prefer a forward fix, and do not restore broad anon grants or public TRUNCATE.
