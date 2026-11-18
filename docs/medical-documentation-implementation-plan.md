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
