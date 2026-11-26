# PainFix condition and service keyword intent map

**Prepared:** 27 November 2026  
**Scope:** The additional condition and treatment clusters requested for PainFix.  
**Status:** Proposed implementation map; this document does not create routes, alter canonicals, or publish clinical service claims.

## URL ownership rules

- The homepage `/` remains the owner of broad local discovery: physiotherapist in Multan, best physiotherapist in Multan, physiotherapy clinic in Multan.
- Condition pages own condition-specific assessment and treatment intent.
- Service pages own modality or rehabilitation-service intent.
- Blog posts retain informational intent (causes, symptoms, exercises, recovery timelines). They should link to the relevant treatment page rather than compete with it.
- Do not create a second URL for a cluster already served by an existing page.
- Do not advertise a service solely because a keyword has search demand. Confirm clinician scope, availability and actual delivery first.

## Verified existing condition-page targets

| Cluster | Preferred URL | Primary keyword | Supporting variants / intent |
|---|---|---|---|
| Sciatica | `/conditions/sciatica` | sciatica treatment in Multan | sciatica physiotherapy, sciatic nerve pain, radiating leg pain, leg numbness with back pain; treatment-seeking |
| Disc bulge / slipped disc | `/conditions/slipped-disc` | slipped disc treatment in Multan | disc bulge physiotherapy, herniated disc rehabilitation, physiotherapy for bulging disc; treatment-seeking |
| Back pain | `/conditions/back-pain` | back pain treatment in Multan | lower back pain physiotherapy, lumbar pain, kamar dard ka ilaj; treatment-seeking |
| Neck pain | `/conditions/neck-pain` | neck pain treatment in Multan | cervical pain physiotherapy, neck stiffness, gardan dard ka ilaj; treatment-seeking |
| Frozen shoulder | `/conditions/frozen-shoulder` | frozen shoulder treatment in Multan | adhesive capsulitis physiotherapy, shoulder stiffness treatment; treatment-seeking |
| Osteoarthritis / arthritis | `/conditions/osteoarthritis` | osteoarthritis physiotherapy in Multan | arthritis physiotherapy, knee osteoarthritis treatment, joint stiffness; condition-specific |
| Knee pain | `/conditions/knee-pain` | knee pain treatment in Multan | knee pain physiotherapy, knee stiffness, ghutno ke dard ka ilaj; broader knee symptom intent |
| Sports injuries | `/conditions/sports-injuries` | sports injury treatment in Multan | sports injury physiotherapy, sprain and strain rehabilitation; condition/assessment intent |
| Shoulder pain | `/conditions/shoulder-pain` | shoulder pain physiotherapy in Multan | rotator cuff-related shoulder pain, painful shoulder movement; do not treat all shoulder pain as frozen shoulder |

## Verified existing service-page targets

| Service cluster | Preferred URL | Primary keyword | Supporting variants / intent |
|---|---|---|---|
| Manual therapy | `/services/manual-therapy` | manual therapy in Multan | joint mobilisation, soft-tissue techniques, hands-on physiotherapy; modality/service intent |
| Sports rehabilitation | `/services/sports-rehabilitation` | sports rehabilitation in Multan | sports injury rehabilitation, return-to-sport rehabilitation; service intent |
| Post-surgical rehabilitation | `/services/post-surgical-rehabilitation` | post-surgical rehabilitation in Multan | post-operative physiotherapy, rehabilitation after knee replacement, recovery after orthopaedic surgery; service intent |
| Stroke rehabilitation | `/services/stroke-rehabilitation` | stroke rehabilitation in Multan | stroke physiotherapy, neuro-rehabilitation, gait and balance rehabilitation; service intent |

The corresponding condition routes may remain useful for condition education. For post-surgical and stroke topics, the service page should be the main conversion destination; the condition page should link to it.

## Pediatric rehabilitation: verification required

The repository contains a pediatric physiotherapy educational blog entry, but the current service catalogue does not contain a dedicated pediatric rehabilitation service. Therefore:

- Do not target `pediatric physiotherapy in Multan` as a clinic service landing page yet.
- Do not add pediatric claims to the homepage, service navigation, structured data or clinician specialties until PainFix confirms that pediatric patients are actively assessed and treated, the age range, relevant presentations, clinician competency and service availability.
- If confirmed, create one clinically reviewed service landing page with clear age range, inclusion/exclusion criteria, assessment approach and referral/red-flag guidance. Keep the existing blog as informational content and link it to that service page.

## Chiropractic care: do not target as an offered service without confirmation

No dedicated chiropractic service exists in the current service catalogue. Do not use `chiropractor in Multan`, `chiropractic care` or `chiropractic treatment` as PainFix service keywords unless the clinic confirms a properly qualified practitioner provides that service. Do not imply that physiotherapy and chiropractic are interchangeable credentials or services.

## Keyword placement and on-page requirements

For each verified target page:

1. Use one clear H1 aligned with the page's primary intent; avoid repeating the same exact phrase in every heading.
2. Include the main keyword naturally in the title, opening copy and one relevant subheading where it reads naturally.
3. Use supporting variants in clinically useful sections and FAQs, not as a keyword list.
4. Explain what assessment covers, what treatment may involve, who may benefit, limitations, precautions and when medical referral is required.
5. Add contextual internal links to the relevant service page, related condition page and appropriate educational article.
6. Include Multan/location context where accurate; do not create thin neighbourhood or city-variant pages.
7. Keep titles and descriptions unique. Avoid duplicating the same meta title across condition and service routes.
8. Do not promise a cure, guaranteed recovery time, disc repositioning, or a fixed number of sessions.

## Informational intent stays with articles

- Exercises, causes, symptoms, prevention and recovery-timeline queries should remain with their matching existing blog posts when those posts satisfy the query.
- In particular, preserve the existing ranking ownership of `/blog/best-exercises-for-lower-back-pain` for “kamar dard ki exercise” and `/blog/best-exercises-for-neck-pain` for neck-exercise queries.
- Link these articles to the appropriate condition page; do not redirect or merge them merely because they mention the same diagnosis.

## Implementation order

1. Preserve the homepage's broad local keyword ownership.
2. Verify and strengthen the existing condition and service pages listed above before creating new URLs.
3. Check current title, description, H1, canonical, sitemap inclusion and internal links for each mapped route.
4. Review pediatric service availability and qualification before adding a service landing page.
5. Keep chiropractic keywords excluded unless the service is confirmed.
6. After implementation, run route/metadata/canonical/sitemap tests and inspect the preview before any production merge.
7. Recheck Search Console query-to-page ownership after Google recrawls the updated pages.

**Important:** This map is a page-ownership specification, not a claim that every keyword has measurable Multan search volume. Use Search Console and local SERP evidence to prioritise actual copy changes.
