-- Update Dr. Jalal Ud Din's public leadership designation without changing
-- his DPT qualification, clinical role in the qualifications list, or profile URL.
BEGIN;

UPDATE public.clinician_profiles
SET designation = 'Co-Founder'
WHERE slug = 'dr-jalal-ud-din-pt-multan'
  AND designation = 'Clinical Physiotherapist';

COMMIT;
