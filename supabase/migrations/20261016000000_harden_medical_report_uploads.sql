-- Keep patient medical reports private and enforce upload limits in Storage,
-- independently of client-side form validation.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-reports',
  'medical-reports',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove earlier broad policies. Permissive policies are OR-combined by RLS,
-- so leaving either one in place would bypass these checks.
DROP POLICY IF EXISTS "Anyone can upload a medical report" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload medical reports" ON storage.objects;
DROP POLICY IF EXISTS "Staff can manage medical reports" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update medical reports" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete medical reports" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload a valid medical report" ON storage.objects;

CREATE POLICY "Anyone can upload a valid medical report" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'medical-reports'
    AND COALESCE(metadata ->> 'mimetype', '') = ANY (ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/avif'
    ]::text[])
    AND CASE
      WHEN COALESCE(metadata ->> 'size', '') ~ '^[0-9]+$'
        THEN (metadata ->> 'size')::bigint BETWEEN 1 AND 10485760
      ELSE false
    END
  );

CREATE POLICY "Staff can update medical reports" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'medical-reports' AND public.is_staff(auth.uid()))
  WITH CHECK (
    bucket_id = 'medical-reports'
    AND public.is_staff(auth.uid())
    AND COALESCE(metadata ->> 'mimetype', '') = ANY (ARRAY[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'image/avif'
    ]::text[])
    AND CASE
      WHEN COALESCE(metadata ->> 'size', '') ~ '^[0-9]+$'
        THEN (metadata ->> 'size')::bigint BETWEEN 1 AND 10485760
      ELSE false
    END
  );

CREATE POLICY "Staff can delete medical reports" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'medical-reports' AND public.is_staff(auth.uid()));
