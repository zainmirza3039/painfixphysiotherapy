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

COMMIT;
