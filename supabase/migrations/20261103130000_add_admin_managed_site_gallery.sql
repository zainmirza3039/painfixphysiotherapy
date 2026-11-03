-- Admin-managed public clinic gallery backed by the existing site-media bucket.
-- Public users can read gallery entries; only administrators can manage them.
BEGIN;

CREATE TABLE IF NOT EXISTS public.site_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  caption text NOT NULL,
  alt_text text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_gallery_storage_path_nonempty CHECK (length(btrim(storage_path)) > 0),
  CONSTRAINT site_gallery_caption_nonempty CHECK (length(btrim(caption)) > 0),
  CONSTRAINT site_gallery_alt_text_nonempty CHECK (length(btrim(alt_text)) > 0),
  CONSTRAINT site_gallery_storage_path_safe CHECK (storage_path !~ '(^|/)\.\.(/|$)')
);

CREATE INDEX IF NOT EXISTS site_gallery_active_order_idx
  ON public.site_gallery (is_active, display_order, created_at);

ALTER TABLE public.site_gallery ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.site_gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_gallery TO authenticated;

DROP POLICY IF EXISTS "Public can read active clinic gallery" ON public.site_gallery;
DROP POLICY IF EXISTS "Authenticated can read clinic gallery" ON public.site_gallery;
CREATE POLICY "Public can read active clinic gallery"
  ON public.site_gallery
  FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can read clinic gallery"
  ON public.site_gallery
  FOR SELECT TO authenticated
  USING (is_active = true OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert clinic gallery items" ON public.site_gallery;
CREATE POLICY "Admins can insert clinic gallery items"
  ON public.site_gallery
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update clinic gallery items" ON public.site_gallery;
CREATE POLICY "Admins can update clinic gallery items"
  ON public.site_gallery
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete clinic gallery items" ON public.site_gallery;
CREATE POLICY "Admins can delete clinic gallery items"
  ON public.site_gallery
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

COMMIT;
