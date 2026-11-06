# Public submission and upload rate limiting

## Public forms

Contact and Home Visit submissions now pass through TanStack Start server functions. The browser no longer inserts directly into either public table. The server validates a strict allowlist, preserves the existing anon-role RLS insert boundary, and checks a persistent database rate limiter before writing.

Rate limits (rolling one-hour windows):

| Flow | Per client | Per email/phone | Global |
|---|---:|---:|---:|
| Contact | 10 | 5 | 100 |
| Home Visit | 5 | 3 | 50 |

On Vercel, the client bucket uses only the platform-provided `x-vercel-forwarded-for` header and hashes the value with the server-only `INTERNSHIP_RATE_LIMIT_SECRET`. Outside Vercel, the helper deliberately uses a shared conservative client bucket rather than trusting arbitrary forwarded headers.

The limiter reuses the existing private `internship_public_rate_limits` counter store. The new RPC is executable only by `service_role`; browser roles cannot call it. Form inserts still execute with the publishable/anon client and remain subject to existing RLS and grants.

## Storage uploads

A database trigger enforces rolling one-hour limits for inserts into the existing `site-media` and `medical-reports` buckets. Counters are stored in a new RLS-enabled table with no API-role grants.

- `site-media`: 30 per authenticated user and 200 global per hour. Anonymous uploads are rejected by the trigger; existing staff RLS policies still decide which authenticated users may upload.
- `medical-reports`: 20 per authenticated user, 10 for the shared anonymous actor bucket, and 50 global per hour. Existing extension, MIME, size, privacy and staff-read policies remain in place.

The Storage API does not expose a trustworthy client IP to this trigger, so upload limits are per authenticated user plus a global cap—not a claim of per-IP enforcement. The medical-reports anonymous allowance is shared across anonymous callers. If this legacy public upload capability is no longer needed, removing anonymous INSERT access is stronger than relying on a shared anonymous quota.

## Git history scanning

The `Secret history scan` workflow fetches complete history and scans added lines across all fetched branches and tags with Gitleaks. It runs on pull requests, pushes to main, daily, and manually. Findings are redacted in CI output. A finding must be triaged; if a credential was exposed, rotate/revoke it at its issuer. Removing a value from the current tree or closing an issue does not invalidate an exposed credential.

## Release and verification

The migration is additive and must be applied before the new application code is deployed. The application changes and migration are proposed together in a reviewable PR. No production migration, deployment, environment-variable update, or live form submission is performed by this change. CI must pass before merge. After staging verification, apply the migration, deploy the app, and test contact, home-visit, media and report uploads with approved test data.
