# Priority 3: Homepage local-commercial SEO

**Status:** Implemented on `seo/homepage-local-commercial-priority-3`; pending CI, preview QA and release.
**Preferred URL:** `/`
**Primary query:** physiotherapist in Multan
**Secondary query cluster:** physiotherapist Multan; physiotherapy in Multan; physiotherapy Multan; best physiotherapist in Multan.

## Scope and rationale

The homepage already has local-query visibility and an established ownership role. This is a controlled snippet optimization, not a redesign.

The existing SEO title, H1, homepage URL, canonical, local business schema, redirects, page sections, clinic location and appointment pathways are preserved. No clinician profile metadata or other landing-page URLs are changed.

## Change made

Updated only the homepage meta description:

> Looking for a physiotherapist in Multan? Visit PainFix in Shalimar Colony for DPT-led assessment and rehabilitation. Book a clinic appointment or ask about a home visit.

The wording introduces a clear local proposition (Shalimar Colony), a relevant care signal (DPT-led assessment and rehabilitation), and an appointment action. CTR improvement is a hypothesis to measure, not a guaranteed ranking gain.

## Preserved signals

- SEO title: `Physiotherapist in Multan | PainFix Physiotherapy Clinic`
- H1: `Physiotherapist in Multan.`
- Canonical: `https://painfixphysiotherapy.com/`
- Homepage remains the preferred URL for broad local clinic discovery.
- `/best-physiotherapist-in-multan`, `/physiotherapist-in-multan`, `/physiotherapy-in-multan` and `/physiotherapy-clinic-in-multan` remain permanent redirects to `/`.
- Home-visit intent remains on `/home-visit`; booking remains on `/book-appointment`.
- Existing clinic details, clinician profiles, local business schema and page structure remain unchanged.

## Regression coverage

The local SEO intent test asserts the homepage title, local meta description, H1, canonical, location/appointment cues, broad-local redirect ownership and separation of the booking workflow. It also verifies that clinic and WhatsApp enquiries continue through their existing external destinations.

## Measurement plan after production release

### Search Console

Record a pre-release baseline and compare weekly at 28-day intervals, using the same Pakistan + Web filters and the homepage URL filter:

- `physiotherapist in Multan`
- `physiotherapist Multan`
- `physiotherapy Multan`
- `physiotherapy in Multan`
- `best physiotherapist in Multan`

Track homepage impressions, clicks, CTR and average position per query. Also inspect all pages receiving these queries to detect ownership drift. Do not interpret a position change from a small impression sample as conclusive.

### Actual appointment enquiries

The current booking workflow does not store a completed enquiry in the website database: clinic appointments continue through Calendly; home-visit / other WhatsApp enquiries are prepared for the user to send. Therefore, count actual completed Calendly bookings and received WhatsApp enquiries from their respective operational records. Do not treat homepage CTA clicks or opening WhatsApp as completed enquiries. Keep a weekly count and distinguish clinic bookings, home visits and online enquiries.

If reliable source attribution is available in Calendly or the clinic's enquiry log, record homepage as the source; do not infer attribution where it is unavailable.

## Release guardrails

- No production deployment until CI passes and the preview is checked.
- Compare title, H1, canonical, redirects, structured data and primary CTA paths before release.
- Reassess CTR and query ownership after sufficient impressions accrue; do not stack further metadata changes during the observation window.
