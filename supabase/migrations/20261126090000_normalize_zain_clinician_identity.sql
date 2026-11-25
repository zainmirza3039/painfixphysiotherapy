-- Normalize Dr Zain's stored public identity fields. Preserve the existing profile slug and URL.
-- This migration is intentionally staged for review; it is not applied to production here.
UPDATE public.clinician_profiles
SET
  full_name = 'Dr. Zain Ul Abideen, DPT',
  meta_title = 'Dr. Zain Ul Abideen, DPT | Physiotherapist in Multan | PainFix',
  meta_description = 'Dr. Zain Ul Abideen, DPT, is a physiotherapist at PainFix Physiotherapy Clinic in Multan, providing evidence-based rehabilitation for back pain, neck pain, sciatica and sports injuries.',
  experience = array_replace(
    COALESCE(experience, ARRAY[]::text[]),
    'Founder & Lead Physiotherapist',
    'Founder & Head Physiotherapist'
  )
WHERE slug = 'dr-zain-ul-abideen-pt-multan'
  AND (
    full_name IS DISTINCT FROM 'Dr. Zain Ul Abideen, DPT'
    OR meta_title IS DISTINCT FROM 'Dr. Zain Ul Abideen, DPT | Physiotherapist in Multan | PainFix'
    OR meta_description IS DISTINCT FROM 'Dr. Zain Ul Abideen, DPT, is a physiotherapist at PainFix Physiotherapy Clinic in Multan, providing evidence-based rehabilitation for back pain, neck pain, sciatica and sports injuries.'
    OR 'Founder & Lead Physiotherapist' = ANY(COALESCE(experience, ARRAY[]::text[]))
  );
