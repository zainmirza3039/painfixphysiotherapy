# Homepage Commercial SEO — Priority 1

**Branch:** `seo/homepage-commercial-intent-priority-1`  
**Scope:** Homepage local-discovery intent only  
**Primary URL:** `/`  
**Primary query:** physiotherapist in Multan

## Implemented changes

1. **Search snippet:** Updated the homepage meta description to explain DPT-led assessment, hands-on treatment, rehabilitation and the Shalimar Colony clinic. Open Graph and Twitter descriptions inherit the same description through the route head.
2. **Hero introduction:** Clarified the clinic's location, care model and actual service scope. The existing H1 remains `Physiotherapist in Multan`.
3. **Clinical authority:** Updated the clinician-section introduction to explain the DPT team and direct users to individual profiles for qualifications and areas of practice.
4. **Internal linking:** Replaced the homepage's `/physiotherapy-in-multan` link, which redirects back to the homepage, with the canonical `/services` destination. Existing appointment, home-visit, service, condition and clinician-profile links remain intact.
5. **Keyword discipline and entity clarity:** Kept `physiotherapist in Multan` as the sole H1/primary phrase. Did not add an unsupported “best” claim or repeat exact-match phrases unnaturally. Added the homepage's MedicalClinic JSON-LD using the same clinic entity ID, NAP, map, hours, area served, clinician references and social profiles already used by local SEO pages.

## Explicitly unchanged

- Homepage URL, title, H1 and canonical.
- Redirects, sitemap and robots directives.
- Booking and home-visit conversion destinations.
- Existing article URLs and keyword ownership.
- No claims of clinical outcomes, superiority or unverified credentials.

## Verification required before merge

- TypeScript and lint checks.
- Production build and route/head rendering.
- Confirm one homepage canonical and one MedicalClinic entity with `@id=https://painfixphysiotherapy.com/#clinic`.
- Validate JSON-LD syntax and required fields.
- Check meta description length and Open Graph/Twitter consistency.
- Confirm the service link resolves to `/services` without redirecting to the homepage.
- Mobile/desktop preview: hero text wrapping, clinician section, CTA layout.
- Regression check that booking and home-visit links are unchanged.

No production deployment is authorised by this change.