-- Add a public clinician directory without changing staff authentication profiles.
-- This migration is prepared for review only; it must not be applied to production
-- until the owner approves the exact schema/storage changes and the migration ledger
-- drift is reconciled.

BEGIN;

CREATE TABLE public.clinician_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  full_name text NOT NULL,
  designation text NOT NULL,
  professional_title text NOT NULL,
  credentials text NOT NULL DEFAULT '',
  bio text,
  seo_bio text,
  specialties text[] NOT NULL DEFAULT '{}'::text[],
  tags text[] NOT NULL DEFAULT '{}'::text[],
  years_experience integer,
  qualifications text[] NOT NULL DEFAULT '{}'::text[],
  photo_path text,
  photo_url text,
  phone_display text,
  whatsapp_number text,
  meta_title text,
  meta_description text,
  intro text[] NOT NULL DEFAULT '{}'::text[],
  expertise text[] NOT NULL DEFAULT '{}'::text[],
  conditions_treated text[] NOT NULL DEFAULT '{}'::text[],
  approach text[] NOT NULL DEFAULT '{}'::text[],
  is_active boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinician_profiles_slug_key UNIQUE (slug),
  CONSTRAINT clinician_profiles_slug_format CHECK (
    char_length(slug) BETWEEN 1 AND 100
    AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  CONSTRAINT clinician_profiles_name_nonempty CHECK (
    char_length(btrim(name)) BETWEEN 1 AND 120
    AND char_length(btrim(full_name)) BETWEEN 1 AND 180
  ),
  CONSTRAINT clinician_profiles_designation_nonempty CHECK (
    char_length(btrim(designation)) BETWEEN 1 AND 160
    AND char_length(btrim(professional_title)) BETWEEN 1 AND 180
  ),
  CONSTRAINT clinician_profiles_years_experience_check CHECK (
    years_experience IS NULL OR years_experience BETWEEN 0 AND 80
  ),
  CONSTRAINT clinician_profiles_display_order_check CHECK (
    display_order BETWEEN 0 AND 100000
  ),
  CONSTRAINT clinician_profiles_photo_path_check CHECK (
    photo_path IS NULL OR (
      photo_path LIKE 'clinician-profiles/' || id::text || '/%'
      AND photo_path ~ ('^clinician-profiles/' || id::text || '/[0-9a-f-]{36}[.](jpg|jpeg|png|webp|avif)$')
    )
  ),
  CONSTRAINT clinician_profiles_photo_url_check CHECK (
    photo_url IS NULL OR photo_url ~ '^/clinicians/[a-z0-9-]+[.](jpg|jpeg|png|webp|avif)$'
  ),
  CONSTRAINT clinician_profiles_whatsapp_format_check CHECK (
    whatsapp_number IS NULL OR whatsapp_number ~ '^[0-9]{8,15}$'
  )
);

COMMENT ON TABLE public.clinician_profiles IS
  'Public PainFix clinician content; intentionally separate from auth-linked public.profiles and staff roles.';
COMMENT ON COLUMN public.clinician_profiles.photo_path IS
  'Object path in the public clinician-photos bucket; uploaded through an admin-authorized signed upload URL.';
COMMENT ON COLUMN public.clinician_profiles.photo_url IS
  'Stable same-site path for the initial bundled public portraits only; new uploads use photo_path.';

CREATE INDEX clinician_profiles_public_order_idx
  ON public.clinician_profiles (display_order, full_name)
  WHERE is_active AND is_published;
CREATE INDEX clinician_profiles_photo_path_idx
  ON public.clinician_profiles (photo_path)
  WHERE photo_path IS NOT NULL;

-- Private asset registry makes photo deletion safe under concurrent admin edits.
-- The composite FK below both scopes assets to one clinician and locks out new
-- references as soon as an unused registry row is deleted.
CREATE TABLE public.clinician_photo_assets (
  path text PRIMARY KEY,
  clinician_profile_id uuid NOT NULL
    REFERENCES public.clinician_profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinician_photo_assets_path_owner_check CHECK (
    path LIKE 'clinician-profiles/' || clinician_profile_id::text || '/%'
    AND path ~ ('^clinician-profiles/' || clinician_profile_id::text || '/[0-9a-f-]{36}[.](jpg|jpeg|png|webp|avif)$')
  ),
  CONSTRAINT clinician_photo_assets_path_owner_unique
    UNIQUE (path, clinician_profile_id)
);

COMMENT ON TABLE public.clinician_photo_assets IS
  'Private registry for uploaded clinician portraits; never exposed to anon or authenticated roles.';

ALTER TABLE public.clinician_profiles
  ADD CONSTRAINT clinician_profiles_photo_asset_fkey
  FOREIGN KEY (photo_path, id)
  REFERENCES public.clinician_photo_assets (path, clinician_profile_id)
  ON DELETE RESTRICT;

ALTER TABLE public.clinician_photo_assets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.clinician_photo_assets FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.clinician_photo_assets TO service_role;

ALTER TABLE public.clinician_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.clinician_profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.clinician_profiles TO anon, authenticated;
GRANT ALL ON TABLE public.clinician_profiles TO service_role;

CREATE POLICY clinician_profiles_public_read
  ON public.clinician_profiles
  FOR SELECT TO anon
  USING (is_active AND is_published);

CREATE POLICY clinician_profiles_authenticated_read
  ON public.clinician_profiles
  FOR SELECT TO authenticated
  USING (
    (is_active AND is_published)
    OR public.is_admin((SELECT auth.uid()))
  );

CREATE TRIGGER update_clinician_profiles_updated_at
  BEFORE UPDATE ON public.clinician_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public clinician portraits are not patient reports. The existing production
-- medical-reports bucket is private and must remain untouched. This dedicated
-- public-read bucket accepts only small raster images. Uploads are issued through
-- a server function only after an authenticated admin check; no anon/authenticated
-- storage write policy is added.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinician-photos',
  'clinician-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
);

-- Preserve the existing public team at rollout while making it editable in the
-- dashboard. These entries are copied from src/data/team.ts; existing portrait
-- assets are copied to stable /clinicians/ URLs by this feature branch.
INSERT INTO public.clinician_profiles (
  name, full_name, designation, professional_title, credentials, bio, seo_bio,
  specialties, tags, slug, photo_url, phone_display, whatsapp_number,
  meta_title, meta_description, intro, qualifications, expertise,
  conditions_treated, approach, is_active, is_published, display_order
)
SELECT
  seed.name, seed.full_name, seed.designation, seed.professional_title,
  seed.credentials, seed.bio, seed.seo_bio, seed.specialties, seed.tags,
  seed.slug, seed.photo_url, seed.phone_display, seed.whatsapp_number,
  seed.meta_title, seed.meta_description, seed.intro, seed.qualifications,
  seed.expertise, seed.conditions_treated, seed.approach,
  true, true, seed.display_order
FROM jsonb_to_recordset($clinician_seed$
[
  {
    "name": "Dr. Zain Ul Abideen",
    "full_name": "Dr. Zain Ul Abideen PT",
    "designation": "Doctor of Physical Therapy (DPT)",
    "professional_title": "Physiotherapist in Multan | DPT",
    "credentials": "DPT (Doctor of Physical Therapy)",
    "bio": "Dr. Zain Ul Abideen leads patient care at PainFix with a focus on evidence-based, personalized rehabilitation. He is dedicated to helping patients overcome pain, recover from injury and restore lasting movement.",
    "seo_bio": "Dr. Zain Ul Abideen PT is a leading physiotherapist in Multan providing evidence-based physiotherapy and rehabilitation. He treats back pain, neck pain, sciatica, sports injuries and post-surgery recovery using manual therapy and modern rehabilitation.",
    "specialties": ["Evidence-Based Physiotherapy", "Manual Therapy", "Sports Rehabilitation", "Musculoskeletal Rehabilitation", "Home Physiotherapy"],
    "tags": ["Back Pain", "Neck Pain", "Sciatica", "Sports Injuries", "Manual Therapy", "Rehabilitation"],
    "slug": "dr-zain-ul-abideen-pt-multan",
    "photo_url": "/clinicians/dr-zain.webp",
    "phone_display": "0314-3039582",
    "whatsapp_number": "923143039582",
    "meta_title": "Dr. Zain Ul Abideen PT — Physiotherapist in Multan | DPT",
    "meta_description": "Dr. Zain Ul Abideen PT is a trusted physiotherapist in Multan offering evidence-based physiotherapy for back pain, neck pain, sciatica, sports injuries and rehabilitation. Book an appointment at PainFix Physiotherapy Clinic.",
    "intro": ["Dr. Zain Ul Abideen PT is a Doctor of Physical Therapy (DPT) and one of the leading physiotherapists in Multan. At PainFix Physiotherapy Clinic he leads patient care with a focus on evidence-based physiotherapy, personalized rehabilitation and long-term recovery.", "Whether you are dealing with persistent back pain, a sports injury or recovering after surgery, Dr. Zain designs individualized treatment plans that target the root cause of your condition — helping you move better and live pain-free."],
    "qualifications": ["Doctor of Physical Therapy (DPT)", "Certified in Manual Therapy techniques", "Trained in Sports Injury Rehabilitation", "Experienced in Home Physiotherapy delivery"],
    "expertise": ["Evidence-Based Physiotherapy", "Manual Therapy", "Sports Rehabilitation", "Musculoskeletal Rehabilitation", "Post-Surgical Rehabilitation", "Home Physiotherapy"],
    "conditions_treated": ["Lower back pain & disc issues (Kamar dard)", "Neck pain & cervical problems (Gardan dard)", "Sciatica & nerve pain", "Sports injuries & muscle strains", "Frozen shoulder & joint stiffness", "Post-operative & fracture rehabilitation"],
    "approach": ["Every treatment begins with a detailed assessment to understand the true source of your pain, not just the symptoms. From there, Dr. Zain builds a tailored plan combining manual therapy, targeted exercise therapy and patient education.", "The goal is lasting recovery — restoring strength, mobility and confidence so you can return to the activities you love without recurring pain."],
    "display_order": 10
  },
  {
    "name": "Dr. Jalal Ud Din",
    "full_name": "Dr. Jalal Ud Din PT",
    "designation": "Clinical Physiotherapist",
    "professional_title": "Physiotherapist in Multan | DPT",
    "credentials": "DPT (Doctor of Physical Therapy)",
    "bio": "Dr. Jalal Ud Din specialises in rehabilitation and recovery, designing individualized treatment plans that target the root cause of each patient's condition for long-term results.",
    "seo_bio": "Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan offering evidence-based physiotherapy and rehabilitation. He treats back pain, neck pain, sciatica, neurological and orthopaedic conditions with individualized, patient-focused care.",
    "specialties": ["Exercise Therapy", "Neurological Rehabilitation", "Orthopaedic Rehabilitation", "Pain Management"],
    "tags": ["Back Pain", "Neck Pain", "Sciatica", "Neuro Rehab", "Orthopaedic Rehab", "Pain Management"],
    "slug": "dr-jalal-ud-din-pt-multan",
    "photo_url": "/clinicians/dr-jalal.webp",
    "phone_display": "0317-0356265",
    "whatsapp_number": "923170356265",
    "meta_title": "Dr. Jalal Ud Din PT — Physiotherapist in Multan | DPT",
    "meta_description": "Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan providing evidence-based physiotherapy for back pain, neck pain, sciatica, neurological and orthopaedic rehabilitation. Book an appointment at PainFix Physiotherapy Clinic.",
    "intro": ["Dr. Jalal Ud Din PT is a clinical physiotherapist in Multan and a Doctor of Physical Therapy (DPT). At PainFix Physiotherapy Clinic he specialises in rehabilitation and recovery, designing individualized treatment plans that address the root cause of each patient's condition.", "From neurological rehabilitation to orthopaedic recovery and pain management, Dr. Jalal is committed to evidence-based physiotherapy that delivers real, long-term results for patients across Multan."],
    "qualifications": ["Doctor of Physical Therapy (DPT)", "Clinical Physiotherapist", "Trained in Neurological Rehabilitation", "Experienced in Orthopaedic Rehabilitation"],
    "expertise": ["Exercise Therapy", "Neurological Rehabilitation", "Orthopaedic Rehabilitation", "Pain Management", "Post-Injury Rehabilitation", "Musculoskeletal Rehabilitation"],
    "conditions_treated": ["Lower back & neck pain (Kamar & gardan dard)", "Sciatica & nerve-related pain", "Stroke & neurological conditions", "Post-fracture & orthopaedic recovery", "Joint pain & arthritis", "Chronic pain management"],
    "approach": ["Dr. Jalal focuses on individualized, patient-centred care. Each plan starts with a thorough evaluation, followed by a structured combination of exercise therapy, hands-on treatment and clear patient education.", "By targeting the underlying cause rather than just symptoms, he helps patients regain function, reduce pain and achieve durable recovery."],
    "display_order": 20
  },
  {
    "name": "Dr. Fatima Iqbal",
    "full_name": "Dr. Fatima Iqbal PT",
    "designation": "Doctor of Physical Therapy (DPT)",
    "professional_title": "Physiotherapist in Multan | DPT",
    "credentials": "DPT (Doctor of Physical Therapy)",
    "bio": "Dr. Fatima Iqbal is a Doctor of Physical Therapy (DPT) at PainFix Physiotherapy Clinic in Multan. Contact the clinic to ask about appointments and discuss your physiotherapy needs.",
    "seo_bio": "Dr. Fatima Iqbal is a Doctor of Physical Therapy (DPT) at PainFix Physiotherapy Clinic in Multan. Contact the clinic to ask about appointments and discuss your physiotherapy needs.",
    "specialties": [],
    "tags": [],
    "slug": "dr-fatima-iqbal-dpt-multan",
    "photo_url": null,
    "phone_display": "0314-3039582",
    "whatsapp_number": "923143039582",
    "meta_title": "Dr. Fatima Iqbal DPT — Physiotherapist in Multan | PainFix",
    "meta_description": "Meet Dr. Fatima Iqbal, Doctor of Physical Therapy (DPT) at PainFix Physiotherapy Clinic in Multan. Contact the clinic to ask about appointments.",
    "intro": ["Dr. Fatima Iqbal is a Doctor of Physical Therapy (DPT) at PainFix Physiotherapy Clinic in Multan. Contact the clinic to ask about appointments and discuss your physiotherapy needs."],
    "qualifications": ["Doctor of Physical Therapy (DPT)"],
    "expertise": [],
    "conditions_treated": [],
    "approach": ["Care begins with an individual physiotherapy assessment and a plan discussed with you in light of your needs and goals."],
    "display_order": 30
  }
]
$clinician_seed$::jsonb) AS seed(
  name text,
  full_name text,
  designation text,
  professional_title text,
  credentials text,
  bio text,
  seo_bio text,
  specialties text[],
  tags text[],
  slug text,
  photo_url text,
  phone_display text,
  whatsapp_number text,
  meta_title text,
  meta_description text,
  intro text[],
  qualifications text[],
  expertise text[],
  conditions_treated text[],
  approach text[],
  display_order integer
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
