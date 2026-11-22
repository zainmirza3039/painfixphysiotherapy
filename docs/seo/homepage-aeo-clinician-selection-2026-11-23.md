# Homepage AEO: choosing a physiotherapist in Multan

**Branch:** `seo/homepage-aeo-clinician-selection-20261123`  
**Primary URL:** `/`  
**Change type:** One factual homepage FAQ, reused by visible FAQ UI and existing FAQ JSON-LD.

## Search evidence

Connected Google Search Console data for the last 28 days, filtered to Pakistan, showed:

- `physiotherapy multan`: 43 impressions, 0 clicks, average position 9.3; homepage.
- `physiotherapist in multan`: 34 impressions, 1 click, average position 9.4; homepage.
- `physiotherapist multan`: 31 impressions, 0 clicks, average position 7.5; homepage.
- `best physiotherapist in multan`: only 3 homepage impressions in the period, so the sample is too small to justify aggressive exact-match targeting.

These are Search Console aggregate observations, not fixed live rankings. They do not establish that an FAQ will improve rankings or generate a rich result.

## Implementation

Add one homepage FAQ: **How should I choose a physiotherapist in Multan?**

The answer provides practical, verifiable selection criteria:
- Published qualification.
- Relevant clinical experience and area of practice.
- A proper history and movement assessment.
- Explanation of treatment goals and options before care begins.
- Review of PainFix's published DPT clinician profiles, with an invitation to contact the clinic to confirm fit and availability.

The existing homepage route already maps `homeFaqs` into the visible FAQ component and the existing `faqLd` JSON-LD. The new answer therefore has one source of truth for both render paths.

## Guardrails

- No use of unsupported superlatives such as “best”, “number one” or guaranteed outcomes.
- No changes to homepage title, meta description, H1, canonical, redirects, sitemap or URL ownership.
- No edits to clinician credentials, profiles, medical claims or booking destinations.
- No changes to existing article titles, descriptions or ranking URLs.
- No production deployment or merge as part of this branch.

## QA

- Run test suite, typecheck, lint and production build.
- Confirm the new question appears once in the visible homepage FAQ.
- Confirm matching FAQ JSON-LD is present in server-rendered homepage HTML.
- Check mobile and desktop FAQ layout and answer readability.
- Review the Vercel preview before approval.

## Measurement

After approval and production release, compare Pakistan-filtered Search Console data using the same 28-day window and query filters. Track impressions, clicks, CTR and position for the local physiotherapist query cluster. Treat the FAQ as an answer-quality and relevance improvement; do not attribute ranking changes to it without sufficient post-release data.
