# PainFix SEO/AEO audit and first implementation — 23 November 2026

## Scope

Improve the existing Dr. Zain clinician profile's search snippet and strengthen the structured meaning of the existing condition pages. Preserve existing URLs and clinical content. No production database or redirect changes.

## Baseline evidence

### Google Search Console

Pakistan, last 28 days, domain property `sc-domain:painfixphysiotherapy.com`:

- `dr zain ul abideen` → `/dr-zain-ul-abideen-pt-multan`: 54 impressions, 0 clicks, average position 8.17.
- `dr zainul abideen` → the same profile: 8 impressions, 0 clicks, average position 8.13.
- The profile is already visible for name variants; the immediate issue is click-through, not the absence of a profile URL.
- `kamar dard ki exercise` → `/blog/best-exercises-for-lower-back-pain`: 136 impressions, 1 click, average position 8.68. Preserve this URL and its query ownership.
- No `/conditions/` URLs appeared in this 28-day Pakistan query/page pull. This is a visibility observation, not proof that the URLs are not indexed.

### Google Business Profile

- Name: PainFix Physiotherapy Clinic.
- Primary category: Physical Therapy Clinic.
- Website: https://painfixphysiotherapy.com/
- Phone: 0314 3039582.
- Address on GBP: Usman Raja Market, Main Road, Shalimar Colony, Multan, Punjab, Pakistan.
- All-time review baseline returned by the connector: 53 reviews, 4.9 average rating.
- Last-28-day activity returned: 286 impressions, 25 clicks, 32 direction requests and 2 calls.

The website address includes the additional landmark “Near Khair Ul Maarif School”. The location is consistent; punctuation and address-line formatting differ. Do not alter the GBP listing without owner confirmation.

### Sitemap

Search Console reports the sitemap `https://painfixphysiotherapy.com/sitemap.xml` with 113 submitted URLs, last submitted 12 November 2026 and last downloaded 20 November 2026, with zero reported warnings/errors. The connector's `indexed` field is deprecated and returns zero; that value must not be interpreted as zero indexed URLs.

## Implementation on the separate branch

1. Override Dr. Zain's profile title and description in the shared doctor SEO builder so database/fallback metadata cannot leave the name-search snippet generic.
2. Keep the existing Person/ProfilePage, DPT credential and PainFix MedicalClinic relationships.
3. Add MedicalWebPage + MedicalCondition JSON-LD to each existing `/conditions/:slug` page. The condition entity is tied to the clinic publisher entity already used by the site.
4. Keep the existing canonical URL, breadcrumb and FAQ JSON-LD.

## Explicitly unchanged

- No URL, slug, redirect, canonical or sitemap entry changes.
- No edits to the ranking back-pain exercise article or its metadata.
- No Supabase migration, database write, profile-content write or storage change.
- No new experience years, registrations, certifications or specialist claims.
- No author/reviewer attribution is added to condition pages because clinical review of each page has not been confirmed.

## Preview QA checklist

- Dr. Zain profile: server-rendered title, description, H1, canonical, Person JSON-LD, DPT credential, clinic relationship and profile links.
- Condition pages: unique title/H1/description per condition; canonical and breadcrumb unchanged; valid MedicalWebPage/MedicalCondition JSON-LD; existing FAQ schema retained.
- Verify sitemap still contains the 14 condition URLs and no duplicate canonical paths.
- Verify old local landing URLs return the intended permanent redirects; Search Console may still show historical URL rows from before redirect deployment.
- Mobile/desktop layout, no console errors, no failed internal links, tests, TypeScript, lint and production build.
- Merge/deploy only after owner approval.
