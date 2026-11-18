# Medical Documentation — Database and Issuance Design

Status: design specification only; no migration or production database changes authorized.
Target branch: `feat/medical-documentation`
Date: 2026-11-19

## 1. Integration boundary

The feature must use the dedicated `personal_patient*` domain, not the legacy `patients` table used by the current `/admin/patients` page.

Live tables confirmed:
- `personal_patients`: clinician-owned patient identity and private notes.
- `personal_patient_plans`: plan and package terms.
- `personal_patient_sessions`: planned/completed treatment sessions.
- `personal_patient_ledger`: immutable financial history.
- `personal_patient_audit_events`: patient-domain audit history.

The repository snapshot inspected has a legacy `/admin/patients` route reading `public.patients`. No dedicated personal-patient route or portal server endpoint was found in the inspected route tree. Before UI implementation, confirm the intended existing personal-patient workflow and do not silently redirect legacy patient operations to the new tables.

## 2. Proposed tables

### `public.medical_document_sequences`
One row per document type:
- `document_type` text primary key; allowed values: `receipt`, `estimate`, `treatment_report`, `expense_statement`.
- `last_number` bigint not null, default 0, check >= 0.
- `updated_at` timestamptz not null.

The sequence is advanced only inside the same database transaction that inserts a document record. Use a single atomic `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING last_number` operation. Never allocate numbers in the browser or by reading then incrementing a value in application code.

Number formats:
- receipt: `PF-R-00001`
- estimate: `PF-E-00001`
- treatment_report: `PF-T-00001`
- expense_statement: `PF-S-00001`

Numbers are never reused, including when a pending issuance fails. Gaps are acceptable; duplicate or recycled numbers are not.

### `public.medical_documents`
One row per issued or pending document:
- `id` uuid primary key.
- `clinician_id` uuid not null references `auth.users(id)`.
- `patient_id` uuid not null; composite FK to `personal_patients(id, clinician_id)` so ownership is enforced by the database.
- `document_type` text with a strict four-value check.
- `document_number` text not null unique; strict format check matching type prefix.
- `status` text not null; allowed lifecycle: `pending`, `issued`, `cancelled`, `superseded`.
- `patient_name_snapshot` text not null; immutable at issuance.
- `snapshot` jsonb not null; immutable full rendered content, with document-type-specific validation in the server contract.
- `verification_token_hash` text not null unique; store SHA-256 digest only, never the raw token.
- `pdf_storage_path` text unique; private bucket path, never a public URL.
- `issued_at` timestamptz nullable until the PDF has been stored and issuance finalized.
- `created_by` uuid not null references `auth.users(id)`.
- `supersedes_document_id` uuid nullable references `medical_documents(id)`.
- `cancelled_at`, `cancellation_reason`, `created_at`, `updated_at`.

Snapshot immutability: document type, number, patient, name snapshot, snapshot JSON, token digest, and creation actor cannot be changed after insertion. A correction creates a replacement document with a new number and an explicit supersession relationship. Status transitions are performed only by a server-side transition function and always append an audit event.

### `public.medical_document_events`
Append-only lifecycle audit:
- `id` uuid primary key.
- `document_id` uuid not null references `medical_documents(id)`.
- `actor_id` uuid nullable for controlled system events.
- `event_type` text constrained to `created_pending`, `issued`, `cancelled`, `superseded`, `pdf_replaced`.
- `details` jsonb not null default `{}`; no raw verification token or unnecessary patient details.
- `created_at` timestamptz not null.
No update/delete for application roles. Audit event insertion is performed in the same transaction as each state transition.

## 3. Issuance and transaction boundaries

Use a server-only issuance service and a tightly permissioned database function. The function:
1. Validates the authenticated clinician owns the selected personal patient.
2. Validates the document-type payload and referenced source records.
3. Allocates the next sequence value atomically.
4. Inserts a `pending` document with immutable snapshot and token digest.
5. Appends `created_pending` event.
6. Returns the document ID, number, and raw token to the trusted server handler only.

The server handler then renders the PDF, uploads it to a private Storage bucket, and calls a state-transition function to set `issued`, `issued_at`, and the private storage path while appending the `issued` event. Storage is not part of the Postgres transaction: if PDF rendering/upload fails, retain the consumed number, mark the pending issuance cancelled/failed through an audited transition, and do not expose it as issued.

Raw verification token exists only in the issuance request/PDF QR URL. Persist only its cryptographic digest. Public verification hashes the supplied token and queries a narrowly scoped server-side verification operation.

All service-role access remains in server-only modules. Do not import `client.server.ts` into client components or ordinary shared modules.

## 4. Document-specific source rules

### Payment receipt
- Source of truth: selected `personal_patient_ledger` rows where `entry_type = 'payment'`.
- Existing ledger sign convention: `payment` and `credit` amounts are negative; `charge` and `refund` amounts are positive; `adjustment` is separately constrained.
- Receipt amount is the positive absolute value of the selected payment entries only.
- Never count package/session `charge` rows as money received.
- Snapshot exact payment entry IDs, dates, payment methods and bank references. A later refund does not rewrite an already issued receipt; the expense statement must show the later refund separately.
- Do not issue a receipt if no qualifying payment entry exists.

### Future treatment estimate
- Based on an explicitly authored provisional plan, not ledger payment entries.
- Must display `PROVISIONAL COST ESTIMATE — NOT A PAYMENT RECEIPT` and `NOT PAID`.
- Must not create a payment or charge ledger row merely by generating an estimate.

### Treatment verification report
- Session dates and completion counts come from actual completed `personal_patient_sessions` records.
- Diagnosis, baseline findings and progress statements must be selected/entered from documented clinical records. Do not infer measurements, diagnosis, or improvement percentages.
- Planned or cancelled sessions must not be represented as completed treatment.

### Consolidated medical expense statement
- Separate historical payments/refunds/adjustments from future estimates.
- Include only PainFix transactions as PainFix financial activity.
- Third-party treatment may be included only as explicitly attributed external/patient-reported information and never as a PainFix receipt.
- Never add projected future estimates to the paid total.

## 5. Public verification contract

Public route: `/verify-medical-document?reference=<raw-token>`.

Return only:
- full patient name (explicitly approved),
- document number,
- document type,
- issue date,
- current status.

Never return CNIC, phone, email, address, internal patient/database IDs, financial line items, clinical findings, or the snapshot JSON.

The verification response confirms that PainFix issued a record and its current status. It does not independently prove the underlying treatment occurred. Source documentation remains the evidentiary basis.

Use no-store response headers, strict input length/format validation, generic not-found responses, and rate limiting. The raw token must not be logged.

## 6. Authorization and RLS

- Enable RLS on all three tables.
- Do not grant `anon` or `authenticated` direct table access to document snapshots, token digests, events, or sequence rows.
- Grant only the minimum required privileges to `service_role`; keep the service-role key server-only.
- The issuance/transition/verification database functions must have fixed safe search paths and explicit EXECUTE grants. Revoke default EXECUTE from PUBLIC, anon and authenticated.
- If a SECURITY DEFINER function is unavoidable, it must have a fixed search_path, explicit ownership/permission checks, and no caller-controlled SQL identifiers. Prefer invoker rights where service_role permissions suffice.
- Public verification uses a dedicated server handler and minimal projection, not direct anonymous table access.
- No patient-facing portal policy is to be added as part of this feature unless a separate portal access model is designed and reviewed.

## 7. PDF and storage

- A4 portrait, English, restrained navy `#032E61`, green `#00A859`, white.
- Reuse existing `pdf-lib`, `@pdf-lib/fontkit`, and `qrcode` dependencies and certificate PDF implementation patterns.
- Digital stamp plus reserved physical stamp area; signatory: **Dr. Zain Ul Abideen, DPT**.
- Private Storage bucket, separate from `medical-reports`; object paths keyed by document UUID and generated server-side.
- PDFs are generated only from the stored immutable snapshot. Re-downloads must not reconstruct a document from mutable current patient data.

## 8. Blocking decisions and pre-implementation checks

1. Migration history is not reconciled. No migration should be applied or marked as equivalent until a schema-only dump and provenance comparison are completed.
2. Current `/admin/patients` uses the legacy `patients` table. The personal-patient workflow needs an explicit route/source decision before wiring document creation.
3. The portal credential/session tables are service_role-only with RLS enabled and no anon/authenticated grants or policies. This is fail-closed and safe if there are no direct client reads. No portal endpoint was found in the inspected route tree; do not add client access policies to clear the advisor warning.
4. Supabase Auth leaked-password protection is disabled. The available project connector has no Auth password-security setting action; this requires an owner-level Dashboard setting change. Recommended setting: enable leaked-password protection in Authentication → Settings → Password Security.
5. The live `medical-reports` bucket is private, 5 MB, and allows only JPEG/PNG/PDF. Frontend validation advertises 10 MB and additional formats. This is a separate pre-existing mismatch; do not alter the bucket as part of this feature without a separate decision.

## 9. Verification plan

Before preview approval:
- Run migration tests against a disposable development database, never production.
- Verify duplicate concurrent number allocation cannot occur.
- Verify no document can be issued for another clinician's patient.
- Verify a charge row cannot generate a receipt.
- Verify estimates create no payment ledger entries.
- Verify only completed sessions appear in treatment reports.
- Verify token hashes only are stored and raw tokens never appear in logs.
- Verify public endpoint exposes only the approved projection and returns no-store.
- Verify cancelled/superseded documents show correct status and replacements have new numbers.
- Decode QR from generated PDFs and confirm the URL reaches the verification route.
- Run typecheck, lint, unit tests, PDF tests, and build; report exact commands/results.
- No production database changes, migration execution, merge, or deployment without separate explicit approval.
