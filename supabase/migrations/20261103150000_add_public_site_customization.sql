-- Published website configuration is public content; draft configuration remains admin-only in clinic_settings.
CREATE TABLE IF NOT EXISTS public.site_customization_public (
  id text PRIMARY KEY DEFAULT 'published' CHECK (id = 'published'),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_customization_public ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_customization_public FROM anon, authenticated;
GRANT SELECT ON public.site_customization_public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_customization_public TO authenticated;
DROP POLICY IF EXISTS "Public can read published website customization" ON public.site_customization_public;
CREATE POLICY "Public can read published website customization"
  ON public.site_customization_public FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage published website customization" ON public.site_customization_public;
CREATE POLICY "Admins can manage published website customization"
  ON public.site_customization_public FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
