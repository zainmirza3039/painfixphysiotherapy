# Homepage Local Commercial SEO Strengthening — 2026-11-23

## Objective
Improve the homepage's relevance for the local commercial keyword cluster while preserving the homepage as the primary local discovery URL.

Primary query themes:
- best physiotherapist in Multan
- physiotherapist in Multan
- physiotherapy in Multan
- physiotherapy clinic in Multan
- physiotherapist / physiotherapy near me (where locally relevant)

## GSC evidence
Pakistan-filtered Search Console data, last 28 days, available through the connected trial:
- `physiotherapist in multan`: homepage received impressions; mobile position varied from the desktop result (mobile 12.16, desktop 1.89 in the device-level pull).
- `physiotherapist multan`: homepage mobile average position 7.70.
- `physiotherapy multan`: homepage mobile average position 9.71.
- `physiotherapy in multan`: homepage mobile average position 11.14.
- `best physiotherapist in multan`: homepage position 25 with 3 impressions; Dr Jalal profile also received impressions around position 10.4.
- GSC also showed impressions for near-me and generic physiotherapy terms on the homepage.
- A 90-day comparison was unavailable because the connected Windsor trial exposes only the last 30 days.

These are low-volume query/device observations, not guarantees of stable rankings.

## Changes in this PR
1. Updated homepage meta description to describe PainFix as a DPT-led physiotherapy clinic in Shalimar Colony, Multan, with assessment, treatment, rehabilitation and citywide home-visit availability.
2. Added a concise, visible hero description explaining the clinic's care model and location. Existing H1 remains unchanged.
3. Changed the City Services section heading to focus on "Physiotherapy in Multan". Rahim Yar Khan online appointments remain accurately described as a secondary service option.
4. Clarified the clinician section's authority statement: PainFix is led by Dr. Zain Ul Abideen, DPT, Founder & Head Physiotherapist. Individual clinician profiles remain linked and unchanged.
5. Added regression assertions for the new homepage copy and page-intent wording.

## Explicitly unchanged
- Homepage URL, title, H1 and canonical.
- Redirects, sitemap, robots directives and structured data.
- Existing page URLs, clinician profile claims and article keyword ownership.
- Booking, clinic appointment, home-visit and online appointment destinations.
- No unsupported "best" or guaranteed-outcome claims.
- No production deployment.

## Verification required
- CI: tests, TypeScript, lint and production build.
- Preview QA: mobile and desktop hero text fit, contrast, CTA visibility and section hierarchy.
- Confirm the clinic and clinician links resolve correctly.
- Confirm metadata renders once and canonical remains the homepage.
- Confirm booking and home-visit destinations are unchanged.
- Review the preview before merge; production deployment requires explicit approval.
