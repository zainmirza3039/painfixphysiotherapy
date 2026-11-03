-- Dedicated public bucket for website media only.
-- Patient records must remain in the separate private medical-reports bucket.
BEGIN;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'site-media',
  'site-media',
  true,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read is intentional for published website assets. Listing and all
-- write operations remain authenticated and role-scoped through object RLS.
DROP POLICY IF EXISTS "Staff can view site media" ON storage.objects;
CREATE POLICY "Staff can view site media"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'site-media'
    AND (
      public.is_admin((SELECT auth.uid()))
      OR (
        (
          public.is_staff((SELECT auth.uid()))
          OR public.can_edit_content((SELECT auth.uid()))
        )
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
    )
  );

DROP POLICY IF EXISTS "Staff can upload site media" ON storage.objects;
CREATE POLICY "Staff can upload site media"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-media'
    AND (
      public.is_admin((SELECT auth.uid()))
      OR (
        (
          public.is_staff((SELECT auth.uid()))
          OR public.can_edit_content((SELECT auth.uid()))
        )
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
    )
  );

DROP POLICY IF EXISTS "Staff can update site media" ON storage.objects;
CREATE POLICY "Staff can update site media"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'site-media'
    AND (
      public.is_admin((SELECT auth.uid()))
      OR (
        (
          public.is_staff((SELECT auth.uid()))
          OR public.can_edit_content((SELECT auth.uid()))
        )
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
    )
  )
  WITH CHECK (
    bucket_id = 'site-media'
    AND (
      public.is_admin((SELECT auth.uid()))
      OR (
        (
          public.is_staff((SELECT auth.uid()))
          OR public.can_edit_content((SELECT auth.uid()))
        )
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
    )
  );

DROP POLICY IF EXISTS "Staff can delete site media" ON storage.objects;
CREATE POLICY "Staff can delete site media"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'site-media'
    AND (
      public.is_admin((SELECT auth.uid()))
      OR (
        (
          public.is_staff((SELECT auth.uid()))
          OR public.can_edit_content((SELECT auth.uid()))
        )
        AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
      )
    )
  );

COMMIT;
