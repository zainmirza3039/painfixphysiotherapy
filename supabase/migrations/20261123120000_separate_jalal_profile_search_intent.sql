-- Separate Dr. Jalal's clinician-entity intent from the homepage's broad Multan clinic intent.
-- The old-value guard protects any newer edits made in the clinician admin before deployment.
UPDATE public.clinician_profiles
SET
  professional_title = 'Clinical Physiotherapist | Neuro & Orthopaedic Rehabilitation',
  seo_bio = 'Dr. Jalal Ud Din PT is a Clinical Physiotherapist at PainFix Physiotherapy Clinic. His clinical interests include neurological rehabilitation, orthopaedic rehabilitation, exercise therapy and pain management.',
  meta_title = 'Dr. Jalal Ud Din PT | Clinical Physiotherapist at PainFix',
  meta_description = 'Dr. Jalal Ud Din PT, Clinical Physiotherapist at PainFix. Interests: neurological and orthopaedic rehabilitation, exercise therapy, pain management.',
  intro = ARRAY[
    'Dr. Jalal Ud Din PT is a Doctor of Physical Therapy (DPT) and Clinical Physiotherapist at PainFix Physiotherapy Clinic.',
    'His clinical interests include neurological rehabilitation, orthopaedic rehabilitation, exercise therapy and pain management. Patients can review his listed areas of practice and contact PainFix to ask about current clinic appointments.'
  ]
WHERE slug = 'dr-jalal-ud-din-pt-multan'
  AND is_active = true
  AND is_published = true
  AND professional_title = 'Physiotherapist in Multan | DPT'
  AND seo_bio = 'Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan offering evidence-based physiotherapy and rehabilitation. He treats back pain, neck pain, sciatica, neurological and orthopaedic conditions with individualized, patient-focused care.'
  AND meta_title = 'Dr. Jalal Ud Din PT — Physiotherapist in Multan | DPT'
  AND meta_description = 'Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan providing evidence-based physiotherapy for back pain, neck pain, sciatica, neurological and orthopaedic rehabilitation. Book an appointment at PainFix Physiotherapy Clinic.'
  AND intro = ARRAY[
    'Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan and a Doctor of Physical Therapy (DPT). At PainFix Physiotherapy Clinic he specialises in rehabilitation and recovery, designing individualized treatment plans that address the root cause of each patient''s condition.',
    'From neurological rehabilitation to orthopaedic recovery and pain management, Dr. Jalal is committed to evidence-based physiotherapy that delivers real, long-term results for patients across Multan.'
  ];
