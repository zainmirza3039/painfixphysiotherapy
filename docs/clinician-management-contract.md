# Clinician management backend contract

## Existing architecture stays intact

Public clinician content remains in `public.clinician_profiles`, separate from the auth-linked `public.profiles` table, staff roles, and accounts. Creating or publishing a public clinician does not create a login. This change does not modify existing RLS, grants, auth, storage, patient/request data, or medical-report behavior.

The existing clinician server actions, admin authorization, portrait-upload flow, and soft-unpublish behavior remain unchanged. No separate management system or email field is introduced.

## Service and CV fields

The additive migration extends the existing clinician table:

| Field          | Database contract                                                            | Application validation                                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `service_mode` | `text NOT NULL DEFAULT 'clinic'`; CHECK allows only `clinic` / `online_only` | Same two values                                                                |
| `city`         | `text NOT NULL DEFAULT 'Multan'`                                             | Trimmed, nonempty, at most 160 characters; database also checks trimmed length |
| `experience`   | `text[] NOT NULL DEFAULT '{}'::text[]`                                       | At most 40 nonempty trimmed entries, each at most 500 characters               |
| `training`     | Same array contract                                                          | Same list limits                                                               |
| `research`     | Same array contract                                                          | Same list limits                                                               |

`qualifications` continues to hold education. `expertise` continues to hold grouped clinical skills. Training and supervised exposure are not independent specialist certifications. No years-of-experience estimate is derived from internships.

The generated Supabase Row/Insert/Update contracts and public/admin TypeScript contracts include all five fields. The shared Zod schema accepts them; omitted new fields use the same clinic/Multan/empty-array defaults for legacy payloads. New frontend forms should always send the five fields explicitly to preserve online-only settings on edits.

## Existing server API

Import functions from `@/admin/clinicians.functions`:

- `listPublishedClinicianProfiles()` and `getPublishedClinicianProfileBySlug(...)` keep the active/published filters and explicit public projection, now including all five fields. Portrait resolution is unchanged.
- `listAdminClinicianProfiles()` keeps verified bearer-token and database-backed admin/super-admin authorization.
- `saveAdminClinicianProfile(...)` continues using the parsed shared payload for insert/update, so the five fields travel through the existing write path. No auth accounts are created.
- Remove/unpublish, clear portrait, signed photo upload, and unused-photo removal actions are unchanged.

Shared types and photo constants remain in `@/admin/clinician-profile.contract`. Publication, routing, directory rendering, WhatsApp links, and shared UI are frontend responsibilities; this backend-only branch changes no UI files.

## Reviewable Ariba seed

`supabase/seeds/ariba-babar.sql` is separate from schema migration. It inserts root slug `ariba-babar` with `service_mode='online_only'`, city `Rahim Yar Khan, Pakistan`, WhatsApp `923120102560`, active/published flags, explicit SEO title/description, and null photo fields. Years of experience remain null. An initials placeholder is a frontend concern.

Only the owner-provided CV details are included. Education, four internship entries, training/volunteer work, and research remain separate. Dry needling appears in training, not as certification. No public email or invented physical branch is added.

`ON CONFLICT (slug) DO NOTHING` makes reruns non-destructive: existing clinicians and later owner edits, publication changes, contact changes, and photos are not overwritten. A conflicting existing slug must be reviewed rather than silently replaced.

## Production prerequisites: do not blindly push migrations

Owner-confirmed project `vagsksstptqqcloccavs` has four existing clinician rows, no Ariba slug, and none of the five new columns. Its live migration ledger contains:

- `20261020163455_create_clinician_management_tables_only`
- `20261020163839_create_clinician_photos_storage_bucket`

Those live-only setup migrations are absent from repository main. The older checked-in `20261017090000_add_clinician_profile_management.sql` is an object-creation proposal and must **not** be replayed against the existing production objects. Do not run `supabase db push` against this unreconciled history. Existing access/storage descriptions in older proposals are not evidence of current production configuration.

Before a separately approved rollout: reconcile the ledger with an authorized owner, verify backup/PITR availability without assuming a backup exists, review the exact additive SQL and seed, and test compatible frontend/backend changes together in staging. Then coordinate the additive schema extension before code that selects the new columns, with the separately approved content seed in the controlled release sequence.

`20261021000000_add_clinician_service_and_cv_fields.sql` changes only the existing clinician table's five columns, related checks, and column comments. It creates no tables, policies, grants, buckets, roles, or triggers. No production SQL, migration, seed, merge, or deployment was executed by this task.

If an application rollback is necessary, preserve added columns and content; do not drop the clinician table, storage bucket, or existing records. Any destructive cleanup requires a separate reviewed plan.

## Tests

`npm test`, `npm run lint`, `./node_modules/.bin/tsc --noEmit`, and `npm run build` validate the backend-only patch. New unit tests cover service/city/list boundaries, exact SQL defaults, additive scope, and seed safety.

`node tests/clinician-migration-smoke.mjs` requires local PostgreSQL binaries and creates a disposable Unix-socket-only cluster. It tests migration and seed reruns, exact legacy defaults, constraint failures, preservation of four synthetic existing rows and their RLS/policy/grant metadata, correct Ariba CV/contact/SEO/photo fields, and preservation of owner edits after a seed rerun. It never reads production database settings. This does not establish production RLS behavior or substitute for staging authorization/upload tests.
