# PainFix Premium Healthcare Website Redesign Plan

## Scope

Refresh the existing PainFix frontend without rebuilding working booking, clinician, authentication, internship, certificate, or admin systems. The first-screen experience must make Multan and Rahim Yar Khan immediately understandable, with truthful service distinctions and direct routes into the existing city-aware booking flow.

## Design direction

Three possible directions were considered: **editorial clinical calm** (0.68), **hospitality-inspired wellness** (0.08), and **high-contrast sports performance** (0.06). The selected direction is **editorial clinical calm**.

- **Design movement:** premium editorial healthcare with quiet Swiss-inspired structure, generous whitespace, and precise navy/green rules.
- **Core principles:** city clarity above the fold; verified information over decoration; restrained hierarchy; accessible, calm interactions.
- **Color philosophy:** PainFix navy communicates clinical trust and permanence; green is reserved for action, progress, and care markers; warm off-white surfaces keep the experience human rather than institutional.
- **Layout paradigm:** asymmetric editorial hero with a compact city decision rail, followed by clear horizontal information bands rather than repeated rounded-card grids.
- **Signature elements:** thin green location rule, small uppercase service labels, and paired city panels that make service availability explicit.
- **Interaction philosophy:** every action explains the next step and preserves city/service query state; hover and focus effects remain subtle and keyboard-visible.
- **Animation:** retain restrained reveal/carousel motion; respect reduced-motion preferences; no decorative looping motion in the city decision area.
- **Typography system:** Newsreader for editorial headlines, Inter for navigation, body copy, controls, and service metadata.
- **Brand essence:** evidence-based movement care for people in Multan and online patients connected to Rahim Yar Khan; calm, precise, human.
- **Brand voice:** confident and specific. Example: “Choose the right way to begin.” / “Online care for Rahim Yar Khan — no physical branch is implied.”
- **Wordmark & logo:** preserve the supplied PainFix logo and existing wordmark treatment.
- **Signature brand color:** PainFix navy `#032E61`, with brand green `#00A859` used only as an action/wayfinding accent.

## Implementation approach

1. Refine `Hero` into a first-viewport city decision experience while preserving the existing responsive image carousel and all three verified booking destinations.
2. Refine `CityServices` as the explicit service-model explanation immediately after the hero; keep Multan clinic/home visits and RYK online-only wording.
3. Simplify and premium-polish the public navigation so Services, Our Team, city selection, and appointment CTA are obvious on desktop and mobile without adding dead routes.
4. Restructure the footer into concise Explore, Locations, and Appointments/Contact groups; include verified address, WhatsApp, internship, certificate verification, legal routes, and dynamically generated copyright.
5. Add a WhatsApp enquiry CTA to the approved internship programme page instead of inventing dates, seats, affiliation, or accreditation; retain the working application/admin backend.
6. Add/update route metadata and `public/manus-routes.json` for public discoverability; preserve existing sitemap behavior.
7. Add regression tests for city truthfulness, footer links, internship enquiry wording, and route manifest coverage.

## Project structure

- `src/routes/`: TanStack file routes and route metadata.
- `src/components/site/`: shared public navigation, homepage sections, footer, booking entry points.
- `src/components/internships/`: public programme, application, and certificate UI.
- `src/lib/`: booking, SEO, Supabase and internship contracts/functions.
- `src/styles.css`: shared tokens and homepage art direction.
- `tests/`: source-level regression and contract tests.
- `public/manus-routes.json`: public page route manifest for the managed web workflow.

## Release boundary

This redesign is implemented on a reviewable branch and PR. Existing production data, migrations, credentials, and admin permissions remain unchanged. Production release requires the normal CI/build checks and explicit merge/deploy approval.
