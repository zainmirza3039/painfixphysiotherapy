# PainFix Medical Documentation Implementation Plan

## Approved identity and presentation
- Clinic: PainFix Physiotherapy Clinic
- Authorized signatory: Dr. Zain Ul Abideen, PT
- Language: English
- Page: A4 portrait
- Visual system: hybrid clinical/corporate; navy #032E61, green #00A859, white
- PDF: digital stamp artwork plus reserved physical-stamp area
- Public verification: full patient name, with no CNIC, phone number, address, or private clinical notes

## Document types
1. Payment receipt (PF-R-00001): only actual payments received by PainFix for services PainFix actually delivered.
2. Future treatment estimate (PF-E-00001): provisional, explicitly NOT PAID and NOT A PAYMENT RECEIPT.
3. Treatment verification report (PF-T-00001): actual recorded baseline, services/sessions delivered, progress supported by documented findings, and current plan.
4. Consolidated expense statement (PF-S-00001): historical PainFix receipts separated from future estimates; third-party services, if included, must be attributed to the external provider and never represented as PainFix revenue or receipt.

## Existing data sources
- personal_patients: patient identity
- personal_patient_plans: treatment/package plan
- personal_patient_sessions: delivered session records and clinical note field
- personal_patient_ledger: financial source of truth (charges, receipts/payments, refunds/adjustments)
- personal_patient_audit_events: audit trail

Do not create a second payment ledger. Do not write into legacy patients or internship certificate tables.

## Required architecture
- Authenticated admin-only server functions for create, issue, cancel, list, and PDF snapshot retrieval.
- Public verification endpoint accepts only a high-entropy opaque token; returns a deliberately minimal public projection, including full patient name as explicitly approved, document number/type, issue date, and current status.
- Verification must be rate-limited, no-store, no-referrer, and noindex.
- Public endpoint must never return financial line items, clinical notes, phone, email, CNIC, or raw patient/database IDs.
- Issued document payload is an immutable snapshot. Corrections require cancellation/supersession and a new document number; never silently mutate an issued PDF.
- QR URL must use the PainFix domain and the same opaque token as the verification record.
- Public verification confirms record authenticity/status only; it does not independently prove care delivery.

## Numbering
- PF-R-00001 receipts
- PF-E-00001 estimates
- PF-T-00001 treatment reports
- PF-S-00001 statements

Numbers must be allocated transactionally and uniquely; do not use client-side counters.

## Critical implementation gate
The remote Supabase migration history and repository migration files are materially divergent. No schema migration, database write, or production configuration change is permitted until migration history is reconciled and reviewed. The initial implementation must be developed on this feature branch, with all schema work isolated and validated against a non-production environment before preview approval.

## Validation gates
1. Reconcile migration history and confirm actual constraints/RLS/policies.
2. Implement contracts, admin server functions, immutable document records, token verification, PDF generation, and admin UI.
3. Test document eligibility, ledger reconciliation, cancellation/supersession, token guessing/rate limiting, data minimization, and PDF/QR rendering.
4. Run typecheck, lint, unit tests, build, and preview smoke tests.
5. Submit preview for explicit approval. Production deployment and live database migration require separate explicit approval.


## 2026-11-19 audit update

The live audit and detailed design are recorded in:
- `docs/medical-documentation-audit-addendum.md`
- `docs/medical-documentation-schema-design.md`
- `docs/supabase-migration-history-reconciliation.md`

Additional implementation constraints:
- The current visible `/admin/patients` route is backed by legacy `public.patients`; it is not the dedicated `personal_patients` workflow. The new documentation UI must not assume these are interchangeable.
- No personal-patient portal route/server endpoint was found in the inspected repository tree. Portal credential/session tables have RLS enabled and no anon/authenticated grants or policies; preserve this fail-closed state.
- The receipt source must be ledger `entry_type = 'payment'` rows only. Package and completed-session triggers create `charge` rows, which are not proof of payment. Ledger payment amounts are negative by convention.
- The live medical-reports bucket is private, 5 MiB and limited to JPEG/PNG/PDF, while frontend validation advertises 10 MiB and additional formats. This separate mismatch is not to be changed under this feature without a distinct approval.
- Leaked-password protection is disabled. Supabase documentation states this feature is available on Pro and above; it requires owner-level Auth settings and is not exposed by the connected Supabase project tools.

### Updated stop conditions

Before any schema migration:
1. Obtain and review a schema-only dump from the live project using a controlled local checkout.
2. Recover remote migration SQL provenance where possible; otherwise document the unmatched history as unrecoverable rather than fabricating equivalence.
3. Decide the intended source/UI route for personal patients.
4. Owner enables leaked-password protection if available on the current Supabase plan.
5. Keep portal tables server-only unless a separate portal authorization design is approved.

No feature source code, schema migration, live database setting, or deployment has been changed by this audit update.


## 2026-11-19 implementation direction

- Source of truth is decided: the new Medical Documentation admin area will use the dedicated `personal_patient*` domain only.
- Preserve the existing `/admin/patients` legacy `public.patients` workflow unchanged; do not merge the two patient stores.
- Keep portal credential/session tables server-only and fail-closed. The medical-document feature does not require patient portal access.
- Use the established `requireSupabaseAuth` middleware and explicit database-backed admin authorization for server functions. Service-role access stays in server-only modules.
- Historical migration provenance cannot be fully reconstructed from the current ledger/catalog. Preserve it as an explicit historical gap; future feature migration must be additive against the live schema, reviewed on the feature branch, and never applied to production without separate approval.
- Leaked-password protection remains an owner-level Auth setting. It is recommended security hardening but is not a reason to expose portal tables or to alter production from this implementation branch.

The source/UI ambiguity is resolved for this feature. The remaining implementation gate is validating the additive migration and application code in a non-production environment without creating a paid Supabase branch. If no free non-production database is available, stop before schema execution and report the exact validation limitation.
