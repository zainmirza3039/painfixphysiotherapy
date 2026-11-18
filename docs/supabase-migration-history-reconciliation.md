# Supabase Migration History Reconciliation — Read-only Findings

Repository: zainmirza3039/painfixphysiotherapy
Branch reviewed: main
Database project: vagsksstptqqcloccavs
Review date: 2026-11-19
Status: NOT RECONCILED — write operations intentionally blocked.

## Inventory
- Supabase remote migration history: 24 entries.
- Repository migration files: 26.
- Exact timestamp/version matches: 6.
- Remote entries without a same-version repository file: 18.
- Repository files without a same-version remote entry: 20.

## Exact matches
- 20260707222303 — 8217b448-1971-481b-a684-a629bbdbda60
- 20261103203202 — secure_contact_blog_and_role_helpers
- 20261103203233 — optimize_contact_blog_gallery_rls_and_fk_indexes
- 20261103203318 — consolidate_blog_post_access_policies
- 20261103203928 — restore_invoker_role_helpers_with_self_role_rls
- 20261103204006 — tighten_role_table_grants_and_consolidate_remaining_rls

## Remote entries without exact repository migration file
- 20261015201946 — restrict_submission_reads_to_staff
- 20261015202247 — restrict_content_writes_to_admins
- 20261015202709 — make_role_helpers_security_invoker
- 20261015202740 — pin_text_search_function_path
- 20261015202910 — optimize_rls_checks_and_fk_indexes
- 20261015203023 — revoke_api_execution_on_rls_event_trigger
- 20261015203243 — add_profile_display_order
- 20261015203424 — restore_self_profile_policies_and_default
- 20261020163455 — create_clinician_management_tables_only
- 20261020163839 — create_clinician_photos_storage_bucket
- 20261020213535 — add_clinician_service_and_cv_fields
- 20261020221352 — add_internship_certificates
- 20261103204118 — declare_service_role_only_policies_for_server_tables
- 20261106072853 — revoke_excess_table_maintenance_privileges
- 20261106073018 — harden_medical_report_upload_metadata_validation
- 20261106073124 — revoke_postgres_public_schema_default_table_sequence_grants
- 20261106074322 — tighten_anon_table_and_function_privileges
- 20261106074347 — tighten_home_visit_and_global_function_defaults

## Repository files not represented in remote migration versions
- 20260707222337_0225766f-b7f4-4569-8baa-5608b53f4692.sql
- 20260711091830_d2637949-92d0-4164-a17c-ccf1e963dbe9.sql
- 20260711091920_ec407bad-6a2c-4608-a08e-fd805ed0d19c.sql
- 20260711092109_37788198-cee0-4ba5-9d81-c416f5669239.sql
- 20260711093043_8f5d31dd-af9d-4718-b161-e75d9f5f47ea.sql
- 20260711210902_972a2138-b04e-4203-a557-471ecf33cfb4.sql
- 20260711210959_2eb647b6-3de8-438f-a11c-cacc95d40762.sql
- 20260711211037_5ad54a5b-1a72-4843-a7f2-c88f6def9aac.sql
- 20260711224438_50733173-50c1-4edd-8e56-9df67d0f71c0.sql
- 20260711224526_c7c33847-513d-4b0a-8c22-7b14011b4173.sql
- 20261016000000_harden_medical_report_uploads.sql
- 20261016133000_harden_public_submission_privileges.sql
- 20261017090000_add_clinician_profile_management.sql
- 20261021000000_add_clinician_service_and_cv_fields.sql
- 20261021022000_internship_certificates.sql
- 20261021022001_seed_clinical_physiotherapy_internship.sql
- 20261021050000_refine_ariba_online_seo.sql
- 20261103110000_add_blog_medical_reviewer.sql
- 20261103120000_fix_admin_media_library_storage.sql
- 20261103130000_add_admin_managed_site_gallery.sql

## Current live schema observations (read-only)
- The personal_patients, personal_patient_plans, personal_patient_sessions, personal_patient_ledger, and personal_patient_audit_events tables exist.
- All five have owner-scoped authenticated RLS policies; audit and ledger tables expose SELECT and INSERT patterns, while session/plan tables have owner-scoped SELECT/INSERT/UPDATE.
- The financial ledger already records payment method and reference fields. It must remain the financial source of truth.
- Existing audit events have JSON details and append-oriented policy/trigger patterns, but they are not a substitute for a dedicated document table with unique document-number/token constraints.

## Reconciliation decision
Do not use migration repair, reset, replay, or apply any migration to production. Remote migration names do not contain their SQL bodies, and timestamp/name similarity is insufficient proof of equivalence. The current schema is the effective live truth, but it does not tell us the exact historical migration contents or ordering semantics.

## Required safe reconciliation procedure
1. Obtain a schema-only dump from the current project with the Supabase CLI (db pull / schema diff workflow) in a controlled local checkout; keep the dump read-only and do not reset the remote database.
2. Compare every local migration's effects against the live schema, including functions, triggers, RLS policies, grants, storage policies, and constraints.
3. For each unmatched remote version, either recover its original SQL from the original authoring source/CI history, or document it as unrecoverable historical metadata. Do not mark an unrelated local file as equivalent.
4. Create a reviewed baseline for a fresh development database, then test the repository migrations from an empty database and compare the resulting schema with the live schema.
5. Only after the diff is understood, add the new medical-documentation migration on the feature branch and test it against a disposable development database.
6. Production migration and migration-history repair require separate, explicit production approval.

## Stop condition
This report is an evidence-based inventory, not a completed repair. Until the schema-only diff and migration-body provenance are available, the history must remain untouched.