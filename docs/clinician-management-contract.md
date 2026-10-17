# Clinician management backend contract

## Why a separate table

The existing `public.profiles` table is keyed by `user_id` and references `auth.users`; it is the signed-in professional's profile workflow. Public clinician content must exist without a login, so this feature leaves `profiles`, `/admin/profile`, and `/admin/users` unchanged and adds `public.clinician_profiles`. No login account is created or deleted when a clinician profile is added, deactivated, or removed from public display. No optional account link is introduced because it is not needed for this workflow.

The migration seeds the three clinicians currently shown by `src/data/team.ts` so the first database-backed release retains the existing names, biographies, specialties, ordering, contact links, qualifications, and profile-page copy. The two existing portrait files are copied to stable `/clinicians/` asset paths; subsequent uploads use the dedicated Storage bucket below.

## Database contract

`public.clinician_profiles` fields:

- Identity and routing: `id` (UUID), unique validated `slug`, `name`, `full_name`.
- Public role and content: `designation`, `professional_title`, `credentials`, `bio`, `seo_bio`, `specialties[]`, `tags[]`, `years_experience`, `qualifications[]`, `intro[]`, `expertise[]`, `conditions_treated[]`, `approach[]`, `meta_title`, and `meta_description`.
- Public contact and photo: `phone_display`, `whatsapp_number`, `photo_url` (legacy same-site portrait only), and `photo_path` (object key for new uploads).
- Publication and ordering: `is_active`, `is_published`, `display_order`, `created_at`, and `updated_at`.

There are no patient/staff-only fields and no `auth.users` foreign key. Constraints validate slugs, required names/designations, nonnegative experience/order, WhatsApp digits, and photo object paths. A partial `(display_order, full_name)` index supports the public active/published list. An update trigger reuses the already-present `public.update_updated_at_column()` function.

## Access contract

- `anon`: `SELECT` only; RLS exposes rows only when `is_active = true AND is_published = true`.
- `authenticated`: `SELECT` only through PostgREST; RLS exposes published active rows, plus all rows to `admin`/`super_admin` using the database-backed `public.is_admin(auth.uid())` helper.
- `anon` and `authenticated` receive no direct `INSERT`, `UPDATE`, `DELETE`, or `TRUNCATE` table grants and there are no direct-write RLS policies.
- `service_role` has table access only for server-side functions. Every management function first verifies the bearer token with `requireSupabaseAuth`, then checks `is_admin` using the authenticated Supabase client. The service-role key remains server-only.
- Removing a clinician is a reversible soft operation (`is_active = false`, `is_published = false`); reactivation/publishing is an admin update. No staff account or related records are deleted.

## Server API for the frontend

Import these server functions from `@/admin/clinicians.functions`:

- `listPublishedClinicianProfiles()` → public rows ordered by `display_order`, then `full_name`; only active/published profiles, explicit safe projection, resolved `photo_url`.
- `getPublishedClinicianProfileBySlug({ slug })` → one public row or `null`; inactive/unpublished profiles behave as missing.
- `listAdminClinicianProfiles()` → all rows, including drafts/inactive, only after verified admin/super-admin authorization.
- `saveAdminClinicianProfile(payload)` → creates when `id` is omitted, otherwise updates. Payload is `ClinicianProfileInput`: `id?`, `slug`, `name`, `full_name`, `designation`, `professional_title`, `credentials`, `bio`, `seo_bio`, `specialties[]`, `tags[]`, `years_experience`, `qualifications[]`, `photo_path`, `phone_display`, `whatsapp_number`, `meta_title`, `meta_description`, `intro[]`, `expertise[]`, `conditions_treated[]`, `approach[]`, `is_active`, `is_published`, and `display_order`. `photo_url` is not writable through this API; initial same-site asset paths are seeded by migration and uploaded images use `photo_path`.
- `removeAdminClinicianProfile({ id })` → unpublishes/deactivates without deleting the row or image.
- `clearAdminClinicianPhoto({ id })` → clears the photo reference; does not delete the image object.
- `createAdminClinicianPhotoUploadUrl({ clinicianId, contentType, sizeBytes })` → returns `{ bucket, path, token }` for a one-object signed upload after admin authorization. Upload the file with `supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, { contentType })`, then save the returned `path` into `photo_path`.
- `deleteAdminClinicianPhoto({ clinicianId, photoPath })` → admin-only removal of an uploaded bucket object, refused while any profile still references it. It cannot delete the initial bundled `/clinicians/` assets.

Use the shared exports from `@/admin/clinician-profile.contract`: `ClinicianProfileInput`, `PublicClinicianProfile`, `AdminClinicianProfile`, `CLINICIAN_PHOTO_BUCKET`, `CLINICIAN_PHOTO_MIME_TYPES`, and `MAX_CLINICIAN_PHOTO_BYTES`. Query keys and UI states remain a frontend concern.

## Photo storage

Production currently has only a private `medical-reports` bucket; it is not appropriate for public clinician portraits and is not changed by this migration. The migration adds a separate public-read `clinician-photos` bucket, 5 MiB maximum object size, and MIME allowlist `image/jpeg`, `image/png`, `image/webp`, and `image/avif`. No anonymous or authenticated upload/delete policy is added. Uploads are granted only by a server-issued signed token after an admin role check; deletion is an admin-checked server operation and refuses referenced photos. Public pages derive the public URL from the stored object path. Clearing/replacing a photo leaves the old object intact until an admin explicitly deletes it after it becomes unreferenced.

## Migration, impact, rollback, and verification

The proposed migration only creates the new clinician table/index/trigger/policies, adds the dedicated public portrait bucket, and seeds the three current public team records. It does not alter `profiles`, roles, auth, patient/appointment/home-visit data, clinic settings, or the existing medical-report bucket. It must remain unapplied until the owner separately reviews and approves the exact production change.

The verified live production migration ledger differs from checked-in migrations, and the live `medical-reports` bucket configuration also differs from the checked-in hardening migration. Do not run `supabase db push` or apply this migration until migration-history drift is reconciled against the live schema and backup/PITR availability is confirmed. No production migration, permission, auth, storage operation, or deployment has been performed here.

Rollback is additive and does not require touching old tables. If rolled back before use, the application can be reverted and the new objects removed after verifying the bucket contains no objects. Once profiles or portrait files exist, do not drop the table or bucket: revert/disable the application integration and preserve the new data/assets for an explicitly reviewed cleanup. No existing records are dropped or rewritten.

## Test boundary

Automated tests cover profile input validation, slug and contact constraints, upload MIME/size/path checks, and migration privilege/policy shape. Build/lint/test results are reported with the PR. No production login, patient/request row read, migration, storage upload, or live write is part of the test plan; end-to-end authorization and upload checks require a safe staging Supabase environment before production approval.
