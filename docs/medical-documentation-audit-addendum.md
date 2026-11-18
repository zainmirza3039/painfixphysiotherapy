# PainFix Medical Documentation — Audit Addendum

Date: 2026-11-19
Project: `vagsksstptqqcloccavs`
Scope: read-only inspection of live schema, Supabase advisors, GitHub source tree and selected migration SQL.
No production writes or deployments performed.

## 1. Confirmed live state

- Supabase project status: `ACTIVE_HEALTHY`; Postgres 17.6.
- Migration ledger: 24 remote rows.
- Repository `supabase/migrations`: 26 SQL files.
- Exact timestamp/name matches: 6.
- Remote rows without exact local file: 18.
- Local files without exact remote version: 20.
- The six exact matches are the first 20260707222303 row and five migrations from 20261103203202 through 20261103204006.

The live schema inventory confirms 29 public tables at this inspection, all with RLS enabled. This is useful evidence of current state but does not reconstruct the original SQL body of each remote migration.

## 2. Reconciliation status: partial, not closed

Selected local SQL was compared with live objects and remote migration names:
- The early local migration `20260711091830_...sql` defines the legacy `patients`, `patient_visits`, appointments and role helpers. The corresponding live tables/functions exist, but that does not prove which remote migration version originally created them.
- Local `20261016000000_harden_medical_report_uploads.sql` describes a private 10 MB bucket and broad valid-file upload policy. The live bucket differs: private, 5 MB, only JPEG/PNG/PDF. Live Storage policies are more restrictive than the original early upload policy but still allow anon INSERT under a 5 MB/type/extension check.
- Local `20261017090000_add_clinician_profile_management.sql` and `20261021000000_add_clinician_service_and_cv_fields.sql` describe clinician profile schema changes. The corresponding clinician profile tables/columns exist live, but the remote migration names/timestamps differ.
- Local internship certificate migration describes internship, participant, experience and certificate tables. Those tables exist live. The migration history nevertheless contains different remote timestamps/names for the setup and later privilege hardening.
- Five 20261103 migration files are exact timestamp/name matches. Their effects are visible in the current role-helper and policy definitions.
- Remote migrations dated 20261015 and 20261106 do not have exact local SQL files. Current grants, policies, functions and schema can be inspected, but the historical SQL bodies cannot be proven from the migration ledger alone.

**Conclusion:** schema-effect comparison is partially evidenced; migration-history provenance remains unresolved. Do not insert fake migration ledger entries, rename unrelated files, reset history, or replay SQL.

To close this item, obtain a schema-only dump and original remote migration SQL from a trusted source (original authoring environment, CI artifacts or a verified backup). A schema dump alone confirms current state, not the historical migration bodies.

## 3. Personal-patient backend and current application gap

Live dedicated tables:
- `personal_patients`
- `personal_patient_plans`
- `personal_patient_sessions`
- `personal_patient_ledger`
- `personal_patient_audit_events`
- `personal_patient_portal_credentials`
- `personal_patient_portal_sessions`

The first five have owner-scoped authenticated grants and RLS policies. Portal credential/session tables have RLS enabled but no policies and no anon/authenticated table grants; only postgres/service_role have table privileges. This is fail-closed and should remain so unless a complete portal authorization model is designed.

No dedicated personal-patient UI route or portal endpoint was found in the inspected repository tree. The visible `src/routes/_authenticated/admin.patients.tsx` is a legacy interface reading/writing `public.patients`, not `personal_patients`. Do not assume it is the UI for the newer personal-patient subsystem.

The personal-patient trigger functions are SECURITY INVOKER (not SECURITY DEFINER). Financial ledger and audit history have mutation-rejection triggers. Plan creation creates a positive `charge` entry; session completion may create a positive `charge` entry. Neither is proof of payment.

Ledger constraints confirm:
- `charge` and `refund`: positive amounts.
- `payment` and `credit`: negative amounts.
- `adjustment`: separately allowed by its own check.
- payment methods include cash, bank_transfer, jazzcash, easypaisa, card and other.

No ledger rows were present at the time of this audit. Do not issue a receipt unless qualifying payment rows exist.

## 4. Auth security

Supabase Security Advisor:
- INFO: RLS enabled/no policies for portal credentials and portal sessions (expected fail-closed configuration if service-side only).
- WARN: leaked-password protection disabled.

The Auth password-security documentation says leaked-password protection checks passwords against the HaveIBeenPwned Pwned Passwords API and is available on the Supabase Pro plan and above. The connected Supabase project tool does not expose an Auth password-security setting update action.

Owner action required: in Supabase Dashboard, open Authentication → Settings → Password Security and enable leaked-password protection if the project plan exposes the setting. This is an Auth configuration change, not a SQL migration. No setting was changed by this audit.

Documentation: https://supabase.com/docs/guides/auth/password-security

## 5. Medical-report Storage mismatch

Live bucket `medical-reports`:
- private
- 5,242,880-byte (5 MiB) limit
- allowed MIME types: JPEG, PNG, PDF

Live upload policy `Safe medical report uploads` permits anon/authenticated INSERT only when bucket, extension, MIME type and metadata size match its 5 MiB allowlist. Staff-only read/manage policies exist.

Frontend `src/lib/medical-report.ts` advertises 10 MiB and also accepts WebP, GIF, HEIC, HEIF and AVIF. This frontend/backend contract mismatch can cause uploads to fail. The bucket must not be changed as part of medical-documentation implementation without a separate approved decision. Align frontend validation to the live contract or separately approve a coordinated Storage change.

## 6. Documentation issuance implications

- The receipt must link only to actual `payment` ledger entries, not positive `charge` entries.
- Future estimates must not write payment or charge rows.
- Completed session counts must come from `personal_patient_sessions.status = 'completed'`.
- Historical receipts remain immutable if later refunds occur; later refunds appear separately in expense statements.
- The legacy `patients` route and personal-patient tables must not be mixed.
- Proposed document schema and issuance controls are in `docs/medical-documentation-schema-design.md`.

## 7. Current actions and blockers

Completed:
- Read-only live project, migration, table, policy, grants, trigger/function and advisor inspection.
- Inspected selected local SQL and relevant server-side auth/PDF patterns.
- Added schema/issuance design specification on the feature branch.

Not completed:
- Full historical migration provenance.
- Schema-only dump comparison from a controlled local checkout.
- Owner-level Auth leaked-password setting.
- Personal-patient UI/source-of-truth decision.
- Feature code, migration, tests or preview.

No production schema, migration ledger, Storage bucket, Auth setting, patient data, deployment or branch billing was changed.


## 8. Safe schema-dump handoff

Use a read-only schema dump, not `supabase db pull`, for this reconciliation. Current Supabase documentation states that `db pull` records a baseline migration in the remote migration ledger. That would mutate the very history under investigation.

After linking the CLI locally to the existing project, the safe public-schema dump command is:

```bash
supabase db dump --linked --schema public --file painfix-public-schema.sql
```

This dumps schema definitions without application table data. Do not run `supabase db pull`, `supabase db push`, `supabase migration repair`, or `supabase db reset --linked` during this audit. The Storage policies/bucket settings and Auth settings should continue to be inspected separately through read-only queries/dashboard because managed schemas are excluded from the normal dump.

The dump can be uploaded here for comparison. Remove any secrets if present before sharing; do not share database passwords, access tokens, or service-role keys.


## 9. Follow-up source and server-architecture inspection

A second read-only pass inspected the current admin route, server-function patterns, server-only Supabase client and auth middleware.

- The existing `src/routes/_authenticated/admin.patients.tsx` is definitively a legacy `public.patients` CRUD screen. It selects, inserts, updates and deletes that table directly from the browser. It is not a personal-patient screen.
- The repo has a server-only `supabaseAdmin` client in `src/integrations/supabase/client.server.ts`; its service-role key is read only inside server code. Existing protected server functions use `requireSupabaseAuth`, then perform an explicit database-backed role check before importing the admin client.
- Existing public verification pages use `no-store`, `noindex` and `no-referrer` headers; the medical-document verification route can follow this established pattern while returning a stricter projection.
- The inspected route tree contains no personal-patient admin route and no patient portal route. The only patient route is the legacy route above.
- Live personal-patient trigger definitions were retrieved. All inspected trigger functions are SECURITY INVOKER with an empty search path. Plan creation and completed-session triggers insert `charge` rows, not `payment` rows. The financial-history mutation trigger rejects updates/deletes.

### Source-of-truth decision for implementation

Implement Medical Documentation as a separate admin area backed exclusively by `personal_patients`, `personal_patient_plans`, `personal_patient_sessions`, and `personal_patient_ledger`. Preserve the existing `/admin/patients` legacy workflow unchanged. Do not link the new documents to legacy `public.patients`, and do not add any direct portal-table grants or policies. This keeps the financial/clinical source coherent and avoids silently migrating or merging two different patient stores.

### Migration reconciliation disposition

The live catalog and migration ledger can be inspected directly through the connected Supabase project, so a user-generated SQL dump is not required for routine inspection. However, the exact historical SQL bodies for unmatched remote versions are not present in the Git branch and cannot be reconstructed from the current catalog alone. The defensible disposition is to preserve the remote ledger, record the unmatched historical provenance as unrecoverable unless a verified backup/CI artifact is found, and make all future feature migrations strictly additive against the inspected live schema. Never fabricate historical equivalence or run migration repair/reset/push as a shortcut.

This is an operational reconciliation decision, not proof that every historical migration body has been recovered. Production migration execution remains blocked until the additive feature migration is reviewed and separately approved.


## 10. Feature-branch implementation update — 2026-11-19

The following source changes have now been prepared on the feat/medical-documentation branch only:

- Added patient-portal and manage-patient-portal Edge Function source files, with service-role-only database access and explicit admin verification for management actions.
- Added opaque 256-bit portal link/session tokens; only SHA-256 digests are stored. Six-digit PINs are HMAC-SHA-256 digests keyed with the server-side Supabase service-role key. Rotating that key requires resetting portal PINs.
- Added database routines in the draft additive migration for atomic PIN attempt counting/30-minute lockout, session validation, credential rotation/revocation, and exact portal financial/session summary totals.
- Portal data projection excludes private clinical notes and is scoped by both patient and clinician IDs. Archived patient records are denied.
- Added a keyed-IP public verification throttle: 20 attempts per 15-minute window. Only an HMAC digest of the client IP is persisted.
- Added automatic cancellation of pending document issuances older than 30 minutes when the admin register is loaded.
- Added a replacement-document workflow. The prior issued document becomes superseded only after the replacement PDF is uploaded and finalization succeeds. Receipt source rows are locked during issuance; a payment cannot belong to two active receipts, but may be reissued after cancellation/supersession.
- Added a clinician/patient filter to personal-patient session status updates.
- Corrected the final calendar-day receipt date filter and signatory designation to DPT.
- Added static contract/security tests for the new portal and verification boundaries.

### Validation still required

- The migration has not been applied. Its SQL routines must be validated against a disposable, non-production database before any live migration.
- The Edge Functions have not been deployed. Their required RPCs do not exist in the live database yet.
- The Vercel build check is blocked by the account's deployment/build-rate limit; no deployment is needed for this source audit.
- The latest branch head does not yet have a completed GitHub CI result. The source has not been represented as end-to-end tested.
- Migration-history provenance remains unresolved. Preserve the existing remote migration ledger and do not run migration repair/reset/push.
- Owner-level leaked-password protection remains a separate Auth dashboard action.

No production database, Auth setting, Storage bucket, patient record, Edge Function deployment, or production website was changed by this implementation pass.


## 11. Automated validation result — 2026-11-19

The latest feature-branch head (b284e902f4b15bad7bf9a7306e3dc3848fcd3c58) passed the repository validation workflow:

- Prettier formatting: passed.
- Deno Edge Function type-check: passed.
- Repository tests: 226 passed, 0 failed.
- TypeScript typecheck: passed.
- ESLint: passed.
- Production application build: passed.
- GitHub PR CI run 44403303475: passed.

The Vercel check remains failed because the connected Hobby account reached its deployment/build-rate limit. No Vercel deployment or preview was created.

These results validate source formatting, static tests, TypeScript/Deno checks, lint and application bundling. They do not validate SQL execution, Supabase RPC permissions at runtime, Storage upload behavior, or end-to-end patient/document workflows. The additive migration and Edge Functions remain undeployed.
