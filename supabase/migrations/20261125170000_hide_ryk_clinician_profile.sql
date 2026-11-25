-- Hide the RYK-only clinician profile from all public PainFix surfaces.
-- Preserve the clinician record and its historical data; this is a visibility change only.
UPDATE public.clinician_profiles
SET is_published = false
WHERE slug = 'dr-areeba-babar-pt';
