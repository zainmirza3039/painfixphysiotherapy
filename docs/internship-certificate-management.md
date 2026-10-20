# PainFix internships and certificate management

## What this adds

The feature extends the existing TanStack Start application and authenticated admin dashboard. It does not create a second login, alter staff roles, modify patient or appointment records, or touch medical-report tables, policies, or storage. No genuine internship programs, fees, schedules, applicants, work records, or credentials are seeded.

Public routes are `/internships`, `/internships/$slug`, `/certificates`, and `/verify-certificate`. The footer exposes these without expanding the primary navigation. Public program pages use database content, existing PainFix components, canonical metadata, and explicit empty/unavailable states. The sitemap advertises the information pages and published program slugs only; it does not include verification tokens or private records.

The protected admin routes are `/admin/internships`, `/admin/internship-applications`, `/admin/internship-participants`, `/admin/experience-records`, and `/admin/certificates`. These use the existing authenticated layout and admin-only gate. Server functions independently verify the bearer token and database-backed `is_admin` authorization; frontend guards are not the security boundary.

## Database review and release order

The additive migration is `supabase/migrations/20261021000000_internship_certificates.sql`. It depends on the existing `auth.users`, `public.is_admin(uuid)` helper and Supabase roles. The existing clinician migration and `docs/clinician-management-contract.md` were reviewed for the project's service-function/RLS conventions. They are not replaced or changed.

The migration creates internship programs, private applications, participants, professional experience records, immutable issued certificate snapshots, audit events, and private request-rate-limit data. Certificate numbers and verification tokens are randomly generated rather than sequential. Issuance, revocation, and documented replacements run as database transactions.

**The migration is prepared, not authorized for production application.** Production schema history and remote drift have not been inspected because this task does not require access to the production database. Before release, an authorized operator must compare deployed migration history and existing helper definitions with this branch, review the additive SQL and permissions, and test it against a representative staging database. Do not reset a database or blindly run `supabase db push` to resolve drift.

After explicit approval, apply the reviewed migration before enabling the new frontend/server release. Validate the staging application with real administrator and ordinary-user accounts before production rollout. If the backend schema/configuration is unavailable, public pages report that honestly rather than displaying fictional offerings. Publishing a program is a separate administrator action after its content and operational arrangements are confirmed.

## Operational workflow

1. Create a draft program. Confirm eligibility, learning objectives, duration, delivery mode, document requirements, selection criteria, attendance, and completion expectations. Only enter confirmed fees, dates, seats, locations, and supervisors.
2. Preview the program, then explicitly publish/open applications. Closing, unpublishing, and archiving are reversible publication actions, not deletion of existing applicant records.
3. Review applications by reference, person, program, and workflow status. Record private notes and decisions. An application receipt does not constitute acceptance or a promise of a certificate.
4. Enrol an accepted applicant as a participant. Record the engagement dates, attendance, supervision, assessment sign-off, and authorized completion decision. Certificate eligibility is checked again on the server/database.
5. For professional experience, create a genuine work/engagement record, accurately choosing employment, internship, training, volunteer, contract, or another engagement type. Verify evidence and authorize the record before issuance.
6. Issue only from an eligible source record, with an approved signatory's printed name/designation. The PDF contains no invented handwritten signature, accreditation seal, registration number, or institutional affiliation.
7. To correct an issued credential, revoke it with a private reason and use the documented replacement path. Do not edit issued facts in place. Retain the audit trail. Verification must show revoked status immediately.

## Certificate PDF and QR

The PDF helper creates a one-page A4 landscape document using the existing `/painfix-logo.png` asset, navy/green branding, and an embedded Unicode font. The font and its licence are bundled under `public/fonts/`. PDF generation is loaded on demand from admin actions. Preview opens a PDF tab for browser printing; download saves the generated PDF.

QR codes point only to `https://painfixphysiotherapy.com/verify-certificate?reference=<unpredictable-token>`. Automated checks independently decode a generated QR and inspect the PDF page dimensions and metadata. The certificate recognizes a recorded engagement/completion; it is not a degree, licence, statutory registration, or an unverified accredited qualification. Verification, rather than the appearance of a downloaded file, establishes current recorded status.

## Privacy and documents

Only necessary application contact, education, availability, and motivation fields are collected. A privacy-consent checkbox is required. Applicants cannot set decision/completion fields. Identity documents are not requested. Document upload is deliberately not implemented: the clinic should arrange a suitable secure collection channel after review rather than accepting documents through public storage or an unapproved upload integration.

Applicant records, private notes, evidence summaries, sign-off details, and audit data are not public verification fields. Verification uses a minimal response and privacy-conscious recipient display; the tokenized page is not indexed or cached. Public program content must never contain applicant information.

The clinic must establish and approve an operational retention period and handle access/deletion requests through its published contact channel. Retain only the information needed for review, lawful recordkeeping, and credential integrity. Do not promise an automatic deletion schedule that has not been configured. Sensitive evidence should not be pasted into free-text notes when a private reference is sufficient.

The application review dialog offers a confirmed anonymization action only for rejected or withdrawn applications. A private decision reason and administrator audit entry are required. Participant/credential source applications cannot be anonymized through this action. The operation removes contact details, educational details, motivation, clinical exposure and private notes while retaining a non-personal reference/status record. Do not put personal details into audit reasons, which are append-only.

## Email and environment configuration

No approved application email service was found in the repository. Submission confirmation is therefore shown on screen with a reference, and applications are reviewed in the admin dashboard. No acceptance or certificate emails are silently sent. An approved provider may be integrated later after template, consent, secret, and delivery controls are reviewed.

The feature reuses existing `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY` configuration. Browser builds use only the existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Never add a service-role key to a `VITE_` variable or client code. Local QA must use isolated configuration, not production credentials.

Set a strong server-only `INTERNSHIP_RATE_LIMIT_SECRET` for hashing client identities. Request admission is a separate persisted RPC transaction, so errors and duplicate submissions cannot undo attempt counters. Submission limits are 20/hour/client, 5/hour/email and 100/hour globally; verification limits are 120/hour/client, 60/hour/reference and 600/hour globally. Expired counters are pruned in bounded batches. Only Vercel's platform-controlled forwarding header is trusted when `VERCEL=1`. Other deployments intentionally share a conservative client bucket; configure and review a trusted reverse-proxy adapter before raising traffic limits rather than trusting arbitrary forwarded headers.

Admin reads are paginated internally and stop at a 10,000-record safety cap per dataset. This is not an analytics/export interface: larger installations need server-side filters and paginated admin UI before exceeding the cap. The database, not the currently displayed list, enforces certificate eligibility, duplicate prevention, capacity and status transitions.

## Validation

Run `bun install --frozen-lockfile`, `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`. The runtime SQL fixture is for an explicitly isolated test database only; review its guard and bootstrap instructions before running. It uses synthetic test records inside transactions, not public offerings or genuine credentials.

To reproduce database checks locally, create a new empty PostgreSQL database whose name starts with `painfix_internship_test_`. Never use a production connection. From the repository root, run the bootstrap once with `psql -X -v ON_ERROR_STOP=1 -1 -d <new-test-database> -f tests/internship-bootstrap.sql`, then run `psql -X -v ON_ERROR_STOP=1 -d <new-test-database> -f tests/internship-security.sql`. Use a local PostgreSQL administrator for the fixture role definitions. The bootstrap refuses existing auth fixtures rather than truncating data; the lifecycle test rolls its records back. This simulates Supabase roles and unsafe default grants in PostgreSQL; it does not replace staging tests of Supabase/PostgREST, JWT handling and real browser sessions.

The final implementation report records actual command outcomes and remaining staging/production validation. A successful local build or isolated PostgreSQL test does not establish that a production migration was applied, that production RLS was tested, or that a deployment took place.
