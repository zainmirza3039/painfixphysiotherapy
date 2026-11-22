-- Separate Dr. Jalal's clinician-entity intent from the homepage's broad Multan clinic intent.
-- The old-value guard protects any newer edits made in the clinician admin before deployment.
UPDATE public.clinician_profiles
SET
  professional_title = 'Clinical Physiotherapist | Neuro & Orthopaedic Rehabilitation',
  seo_bio = 'Dr. Jalal Ud Din PT is a Clinical Physiotherapist at PainFix Physiotherapy Clinic. His clinical interests include neurological rehabilitation, orthopaedic rehabilitation, exercise therapy and pain management.',
  meta_title = 'Dr. Jalal Ud Din PT | Clinical Physiotherapist at PainFix',
  meta_description = 'Meet Dr. Jalal Ud Din PT, a Clinical Physiotherapist at PainFix. Review his clinical interests in neurological and orthopaedic rehabilitation, exercise therapy and pain management.',
  intro = ARRAY[
    'Dr. Jalal Ud Din PT is a Doctor of Physical Therapy (DPT) and Clinical Physiotherapist at PainFix Physiotherapy Clinic.',
    'His clinical interests include neurological rehabilitation, orthopaedic rehabilitation, exercise therapy and pain management. Patients can review his listed areas of practice and contact PainFix to ask about current clinic appointments.'
  ]
WHERE slug = 'dr-jalal-ud-din-pt-multan'
  AND is_active = true
  AND is_published = true
  AND professional_title = 'Physiotherapist in Multan | DPT'
  AND meta_title = 'Dr. Jalal Ud Din PT — Physiotherapist in Multan | DPT';
