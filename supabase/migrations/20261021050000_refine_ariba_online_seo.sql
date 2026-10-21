-- Refine the published Ariba Babar profile for truthful online-video search intent.
-- This is intentionally scoped to the existing online-only profile and does not
-- create a branch, clinic listing, or unsupported ranking claim.
UPDATE public.clinician_profiles
SET
  seo_bio = 'Ariba Babar, DPT provides online video physiotherapy consultations for patients in Rahim Yar Khan, Pakistan. Her profile covers structured assessment, rehabilitation planning, patient education and supervised clinical exposure; online suitability and availability are confirmed before booking.',
  meta_title = 'Ariba Babar DPT | Online Physiotherapist in Rahim Yar Khan',
  meta_description = 'Book an online video consultation with Ariba Babar, DPT, an online physiotherapist serving Rahim Yar Khan. Ask about availability and suitability via WhatsApp.',
  tags = ARRAY['Online physiotherapy', 'Video consultation', 'Online physiotherapist', 'Rahim Yar Khan', 'Patient education', 'Rehabilitation planning']::text[],
  intro = ARRAY[
    'Ariba Babar, DPT provides online video physiotherapy consultations for patients in Rahim Yar Khan, Pakistan. Her approach focuses on structured assessment, rehabilitation planning, patient education and safe, patient-centred care.',
    'Online care is arranged after a suitability discussion. Message Ariba on WhatsApp to ask about availability and booking; no physical PainFix clinic or walk-in appointment is offered at this location.'
  ]::text[]
WHERE slug = 'ariba-babar'
  AND service_mode = 'online_only';
