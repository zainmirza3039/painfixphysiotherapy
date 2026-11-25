-- Complete the stored profile copy normalization after the initial identity migration.
-- Preserve the clinician slug, existing qualifications, and all experience history.
UPDATE public.clinician_profiles
SET
  seo_bio = replace(
    COALESCE(seo_bio, ''),
    'Dr. Zain Ul Abideen PT',
    'Dr. Zain Ul Abideen, DPT'
  ),
  intro = ARRAY(
    SELECT replace(
      item,
      'Dr. Zain Ul Abideen PT',
      'Dr. Zain Ul Abideen, DPT'
    )
    FROM unnest(COALESCE(intro, ARRAY[]::text[])) AS item
  )
WHERE slug = 'dr-zain-ul-abideen-pt-multan'
  AND (
    COALESCE(seo_bio, '') LIKE '%Dr. Zain Ul Abideen PT%'
    OR EXISTS (
      SELECT 1
      FROM unnest(COALESCE(intro, ARRAY[]::text[])) AS item
      WHERE item LIKE '%Dr. Zain Ul Abideen PT%'
    )
  );
