# PainFix Personal Patient Ledger — Outcome Checklist

## Patient account lifecycle

- [x] Register a patient with name, phone, email and private clinician notes.
- [x] Search patients by name, phone and patient ID.
- [x] Open the correct patient account without a page reload or return to the list.
- [x] Edit patient details and preserve clinician ownership.
- [x] Archive a patient without deleting history and restore an archived patient.

## Billing and ledger

- [ ] Support package, per-session and custom pricing without hardcoded treatment fees.
- [ ] Record advance, partial and full payments and calculate dues versus credit.
- [x] Record refunds and adjustments as immutable compensating ledger entries.
- [ ] Keep completed billable session charges single-created by database trigger.
- [ ] Export a patient statement and print a receipt/statement.

## Portal and privacy

- [x] Keep portal data read-only and patient-scoped.
- [x] Preserve token hashing, PIN hashing, expiry, revocation and noindex behavior.
- [x] Restrict portal CORS to configured trusted origins and do not silently ignore audit failures.

## Verification

- [x] TypeScript validation passes.
- [x] Targeted patient-ledger regression checks pass.
- [x] Existing public website routes remain unchanged.
- [ ] No production database, merge, or deployment action is performed without explicit approval.
