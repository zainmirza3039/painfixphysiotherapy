-- Additive clinician contract extension. Apply only after reconciling the live
-- Supabase migration ledger; this migration intentionally does not replay the
-- clinician table/storage setup or touch unrelated tables.
BEGIN;

ALTER TABLE public.clinician_profiles
  ADD COLUMN IF NOT EXISTS service_mode text NOT NULL DEFAULT 'clinic',
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT 'Multan',
  ADD COLUMN IF NOT EXISTS experience text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS training text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS research text[] NOT NULL DEFAULT '{}'::text[];

DO $contract$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinician_profiles_service_mode_check' AND conrelid = 'public.clinician_profiles'::regclass) THEN
    ALTER TABLE public.clinician_profiles
      ADD CONSTRAINT clinician_profiles_service_mode_check
      CHECK (service_mode IN ('clinic', 'online_only'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clinician_profiles_city_check' AND conrelid = 'public.clinician_profiles'::regclass) THEN
    ALTER TABLE public.clinician_profiles
      ADD CONSTRAINT clinician_profiles_city_check
      CHECK (char_length(btrim(city)) BETWEEN 1 AND 160);
  END IF;
END
$contract$;

COMMENT ON COLUMN public.clinician_profiles.service_mode IS
  'Whether this clinician serves at a PainFix clinic or online only.';
COMMENT ON COLUMN public.clinician_profiles.city IS
  'Clinician service location label; trimmed, non-empty, and at most 160 characters.';
COMMENT ON COLUMN public.clinician_profiles.experience IS
  'Reviewable CV experience entries; does not imply unsupported years or specialist claims.';
COMMENT ON COLUMN public.clinician_profiles.training IS
  'Reviewable training entries; training is not represented as certification unless explicitly documented.';
COMMENT ON COLUMN public.clinician_profiles.research IS
  'Reviewable research entries.';

-- Insert the owner-approved online-only profile in the same transaction.
-- On rerun, preserve all later admin edits and publication/photo changes.
INSERT INTO public.clinician_profiles (
  slug, name, full_name, designation, professional_title, credentials,
  bio, seo_bio, meta_title, meta_description, specialties, tags, qualifications, expertise,
  conditions_treated, approach, intro, service_mode, city, phone_display,
  whatsapp_number, experience, training, research, photo_path, photo_url,
  is_active, is_published, display_order
) VALUES (
  'ariba-babar', 'Ariba Babar', 'ARIBA BABAR, DPT',
  'Doctor of Physical Therapy', 'Doctor of Physical Therapy', 'DPT',
  'Doctor of Physical Therapy with clinical internship experience across outpatient rehabilitation clinics and a tertiary-care teaching hospital. Supervised clinical exposure includes musculoskeletal, neurological, orthopaedic and cardiopulmonary rehabilitation, manual therapy, therapeutic exercise, chest physiotherapy, patient handling and mobility training. Focused on structured clinical assessment, evidence-informed rehabilitation planning, patient education and safe, patient-centred care.',
  'Ariba Babar, DPT provides online physiotherapy consultations from Rahim Yar Khan, Pakistan, with supervised clinical exposure across musculoskeletal, neurological, orthopaedic and cardiopulmonary rehabilitation.',
  'Ariba Babar DPT — Online Physiotherapy in Rahim Yar Khan | PainFix',
  'Enquire about online physiotherapy with Ariba Babar, DPT, based in Rahim Yar Khan, Pakistan. Contact her directly on WhatsApp for availability and booking.',
  '{}'::text[],
  ARRAY['Online physiotherapy', 'Rahim Yar Khan', 'Patient education', 'Rehabilitation planning'],
  ARRAY['Doctor of Physical Therapy (DPT) — Hassan Institute of Health Sciences, Rahim Yar Khan; affiliated with University of Sargodha, 2020–2025', 'FSc Pre-Medical — Punjab Group of Colleges, 2018–2020', 'Matric Science — National Garrison Secondary School, 2016–2018'],
  ARRAY['Patient assessment, history taking, functional assessment and documentation', 'Rehabilitation planning and clinical reasoning', 'Manual therapy, therapeutic exercise and stretching', 'Pain management, electrotherapy modalities and kinesiology taping', 'Chest physiotherapy and cardiopulmonary rehabilitation', 'Neurological and orthopaedic rehabilitation', 'Mobility, transfer training and patient education', 'Communication and multidisciplinary teamwork'],
  ARRAY['Musculoskeletal rehabilitation', 'Neurological rehabilitation', 'Orthopaedic rehabilitation', 'Cardiopulmonary rehabilitation'],
  ARRAY['Structured clinical assessment and evidence-informed rehabilitation planning', 'Safe, patient-centred care with patient education'],
  ARRAY['Doctor of Physical Therapy with clinical internship experience across outpatient rehabilitation clinics and a tertiary-care teaching hospital. Supervised clinical exposure includes musculoskeletal, neurological, orthopaedic and cardiopulmonary rehabilitation, manual therapy, therapeutic exercise, chest physiotherapy, patient handling and mobility training. Focused on structured clinical assessment, evidence-informed rehabilitation planning, patient education and safe, patient-centred care.', 'Online physiotherapy consultations for patients seeking structured assessment, rehabilitation planning and education.', 'Based in Rahim Yar Khan, Pakistan, with booking enquiries handled through WhatsApp.'],
  'online_only', 'Rahim Yar Khan, Pakistan', '+92 312 0102560', '923120102560',
  ARRAY['Clinical Physiotherapy Intern — Sheikh Zayed Postgraduate Medical Institute & Hospital, Lahore (August 2026 – September 2026); supervised exposure in Neurology, Orthopedics, Cardiology, Cardiothoracic, ICU, Neuro ICU and Burn ICU.', 'Physiotherapy Intern — Mahmood Physiotherapy Clinic, Rahim Yar Khan (June 2026 – August 2026).', 'Physiotherapy Intern — Hamza Medicare Hospital, Rahim Yar Khan (September 2024 – October 2024).', 'Physiotherapy Intern — Mahmood Physiotherapy Clinic, Rahim Yar Khan (July 2024 – September 2024).'],
  ARRAY['Manual Therapy Techniques hands-on workshop, The Healthcare Clinic, Rahim Yar Khan, 8 September 2025; supervised by Dr. Dileep Kumar, PT.', 'Additional training: kinesiology taping, dry needling and CPR.', 'Participated in a free physical therapy camp.'],
  ARRAY['Prevalence of Musculoskeletal Pain Among Rickshaw Drivers of Rahim Yar Khan — observational cross-sectional study, University of Sargodha, 2025.'],
  NULL, NULL, TRUE, TRUE, 40
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
