-- Publish the confirmed PainFix clinical physiotherapy internship programme.
-- This is intentionally separate from the schema migration so programme content can be
-- reviewed or changed without rewriting the internship/certificate tables.
INSERT INTO public.internship_programs (
  title,
  slug,
  description,
  discipline,
  duration,
  delivery_mode,
  eligibility,
  objectives,
  requirements,
  location,
  schedule,
  seats,
  fees,
  application_open_at,
  application_close_at,
  applications_open,
  status,
  required_documents,
  selection_criteria,
  supervisor,
  completion_criteria,
  minimum_attendance,
  faqs
)
VALUES (
  'PainFix Clinical Physiotherapy Internship Programme',
  'clinical-physiotherapy-internship',
  'A 40-working-day supervised educational internship at PainFix Physiotherapy Clinic for final-year DPT students and DPT graduates. The programme combines structured observation, guided practical learning and professional development; it does not replace a university placement, clinical licence or independent practice authorization.',
  'Clinical Physiotherapy',
  '40 working days (80 scheduled hours)',
  'on_site',
  'Final-year DPT students and DPT graduates.',
  ARRAY[
    'Days 1–10 — Orientation and assessment: clinic induction, patient safety, consent, privacy, documentation standards and observation of assessment reasoning.',
    'Days 11–20 — Musculoskeletal physiotherapy: history-taking, examination frameworks, exercise selection, patient education and supervised case discussion.',
    'Days 21–30 — Neurological and geriatric rehabilitation: mobility, balance, functional training, safe assistance and person-centred communication under supervision.',
    'Days 31–35 — Sports and fitness rehabilitation: movement screening, progressive exercise, load management, injury prevention and return-to-activity principles.',
    'Days 36–40 — Integration and evaluation: supervised case presentation, feedback, practical competency assessment and completion review.'
  ],
  ARRAY[
    'Apply only if you are a final-year DPT student or a DPT graduate.',
    'Attend on site at the published schedule and follow PainFix confidentiality, safeguarding and professional-conduct requirements.',
    'Observe and participate only within your level of training and under assigned physiotherapist supervision; interns must not practise independently or present themselves as licensed clinicians.',
    'Provide accurate application, availability and education details. Application review and acceptance are separate from certificate eligibility.'
  ],
  'PainFix Physiotherapy Clinic, Multan, Pakistan',
  'Monday–Saturday, 2:00 PM–4:00 PM Pakistan Standard Time (2 hours daily; 12 hours weekly; 80 scheduled hours over 40 working days).',
  NULL,
  'PKR 6,000',
  NULL,
  NULL,
  true,
  'published',
  ARRAY[]::text[],
  'Eligibility, availability for the published schedule and application quality are reviewed by the PainFix team. Upcoming batch dates and available places are confirmed directly with the clinic.',
  NULL,
  'Complete the supervised educational activities, achieve at least 90% attendance (72 of 80 scheduled hours), complete the practical competency assessment, receive feedback and pass the authorized completion review. A certificate, if issued, is a separate decision and is not guaranteed by application or attendance alone.',
  90,
  '[
    {"q":"When does the next batch start?","a":"Batch start dates are confirmed directly with PainFix. Submit an application with your availability; the team will confirm the next suitable batch before acceptance."},
    {"q":"Are seats limited?","a":"Availability is confirmed by the clinic for each batch. Because this is supervised on-site learning, applying does not guarantee a place."},
    {"q":"Will I treat patients independently?","a":"No. Interns observe and participate only within their training level and under assigned physiotherapist supervision. The programme does not grant a licence or authorization for independent practice."},
    {"q":"Is a certificate guaranteed?","a":"No. Completion review, attendance, practical competency and authorized record checks are required before a certificate may be issued. A certificate is not a degree, licence or independently accredited qualification."}
  ]::jsonb
)
ON CONFLICT (slug) DO NOTHING;
