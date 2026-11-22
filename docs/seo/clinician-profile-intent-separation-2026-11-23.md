# Clinician Profile Search-Intent Separation — 2026-11-23

## Objective
Keep broad local commercial searches on the PainFix homepage while clinician profiles focus on named-person/entity searches and accurately listed clinical roles.

## Search Console evidence
Pakistan-filtered GSC, last 28 days, device-level rows:
- `best physiotherapist in multan`: homepage 3 impressions at average position 25; Dr. Jalal profile 8 impressions at 10.38.
- `physiotherapist in multan`: homepage 25 mobile impressions at 12.16; Dr. Jalal profile 3 mobile impressions at 10.33.
- `physiotherapist multan`: homepage 30 mobile impressions at 7.70; Dr. Jalal profile 8 mobile impressions at 11.13.
- `physiotherapy multan`: homepage 41 mobile impressions at 9.71; Dr. Jalal profile had 3 desktop impressions at 24.67.

These are low-volume signals of overlapping relevance, not proof of a ranking penalty or guaranteed cannibalization.

## Live URL verification
- `/physiotherapist-in-multan` redirects to `/`.
- `/physiotherapy-in-multan` redirects to `/`.
- The redirects are present in `vercel.json`; this work does not alter them.
- GSC still attributes some recent query rows to those legacy URLs. Treat these as residual/stale attribution until a fresh crawl and subsequent GSC data confirm consolidation; do not recreate or delete these URLs based on those rows alone.

## Changes
- Dr. Jalal's profile metadata now identifies him by name, DPT and Clinical Physiotherapist role, with his listed neurological/orthopaedic rehabilitation, exercise therapy and pain-management interests.
- The visible professional-title line is similarly role-specific rather than repeating the homepage's broad `Physiotherapist in Multan` commercial phrase.
- Dr. Zain's profile remains the clinician-authority page for his own name and verified founder/head role.
- Homepage remains the broad local clinic landing page.
- A guarded Supabase migration updates the currently published Dr. Jalal profile only if its old title and meta title still match the audited values. This prevents overwriting newer admin edits.
- Static fallback profile content is kept consistent with the database migration.

## Preserved
- No changes to URLs, canonicals, redirects, sitemap, homepage H1/title, booking paths or home-visit conversion paths.
- No unsupported “best” claims or invented qualifications.
- No changes to clinical condition pages or the ranking lower-back exercise article.

## Verification
- Run clinician SEO tests, full tests, typecheck, lint and production build.
- Review Dr. Jalal and Dr. Zain profile previews, metadata, mobile rendering and canonical URLs.
- Verify the migration's old-value guard against the currently published row before production rollout.
