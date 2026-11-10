# PainFix Personal Patient Ledger Completion Plan

## Scope

Complete the existing personal-patient feature on `feat/personal-patient-ledger` without changing the public website, applying production migrations, merging, or deploying.

## Implementation approach

- Preserve the existing React 19, TanStack Router/Query, Supabase, Tailwind and shadcn patterns.
- Make patient-account navigation a real TanStack route link and add reliable edit/archive/restore behavior.
- Complete immutable financial correction workflows with refund and adjustment entries; never update or delete ledger history.
- Harden portal response headers and origin handling without exposing private clinical data.
- Keep all database changes additive and staged in migrations only; production application requires owner approval.
- Validate with TypeScript, targeted source tests, lint/build where possible, and a clean Git diff.

## Project structure

- `src/routes/_authenticated/admin.personal-patients.tsx`: patient list, search, registration and lifecycle actions.
- `src/routes/_authenticated/admin.personal-patients.$patientId.tsx`: account, plans, sessions, ledger, portal and audit history.
- `src/admin/personal-patients.db.ts`: isolated Supabase query boundary.
- `supabase/functions/*patient-portal*`: server-side portal credential and read-only data access.
- `supabase/migrations/`: additive ownership, ledger and security controls.
- `tests/`: source-level regression checks.

## Design

- **Chosen movement:** clinical operations console — quiet, information-dense, mobile-first, and action-oriented.
- **Principles:** clear account state, reversible financial corrections through compensating entries, private-by-default clinical data, and usable RTL presentation.
- **Palette:** PainFix navy `#032E61`, green `#00A859`, white surfaces, restrained semantic status colors.
- **Interaction:** every button commits a real mutation or opens a complete form; destructive lifecycle actions are explicit and archive rather than delete.
- **Typography:** existing system UI for English with Noto Nastaliq Urdu loaded only when Urdu mode is active.
- **Brand essence:** a dependable clinician ledger for real daily practice — private, accountable, practical.
