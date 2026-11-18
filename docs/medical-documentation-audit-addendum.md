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
