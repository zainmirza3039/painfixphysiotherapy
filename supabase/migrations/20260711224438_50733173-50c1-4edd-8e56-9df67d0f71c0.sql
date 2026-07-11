
-- 1) Extend profiles with richer professional fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS certifications text,
  ADD COLUMN IF NOT EXISTS clinical_interests text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Flexible fitness content CMS
CREATE TABLE IF NOT EXISTS public.fitness_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL DEFAULT 'programme',
  title text NOT NULL,
  slug text,
  excerpt text,
  body text,
  featured_image text,
  category text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  seo_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 100,
  extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fitness_content_status_chk CHECK (status IN ('draft', 'published')),
  CONSTRAINT fitness_content_type_chk CHECK (content_type IN (
    'service','programme','workout_plan','online_coaching','mobility',
    'stretching','injury_prevention','warmup_cooldown','assessment',
    'resource','membership','faq'
  ))
);

CREATE UNIQUE INDEX IF NOT EXISTS fitness_content_type_slug_key
  ON public.fitness_content (content_type, slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS fitness_content_author_idx ON public.fitness_content (author_id);
CREATE INDEX IF NOT EXISTS fitness_content_status_idx ON public.fitness_content (status);

GRANT SELECT ON public.fitness_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fitness_content TO authenticated;
GRANT ALL ON public.fitness_content TO service_role;

ALTER TABLE public.fitness_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published fitness content"
  ON public.fitness_content FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can read own fitness content"
  ON public.fitness_content FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Admins can read all fitness content"
  ON public.fitness_content FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authors can insert own fitness content"
  ON public.fitness_content FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.can_edit_content(auth.uid()));

CREATE POLICY "Authors can update own fitness content"
  ON public.fitness_content FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND public.can_edit_content(auth.uid()))
  WITH CHECK (author_id = auth.uid() AND public.can_edit_content(auth.uid()));

CREATE POLICY "Authors can delete own fitness content"
  ON public.fitness_content FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND public.can_edit_content(auth.uid()));

CREATE POLICY "Admins can manage all fitness content"
  ON public.fitness_content FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE TRIGGER update_fitness_content_updated_at
  BEFORE UPDATE ON public.fitness_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Editable calculator intro/disclaimer text
CREATE TABLE IF NOT EXISTS public.calculator_settings (
  key text NOT NULL PRIMARY KEY,
  heading text,
  description text,
  disclaimer text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.calculator_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calculator_settings TO authenticated;
GRANT ALL ON public.calculator_settings TO service_role;

ALTER TABLE public.calculator_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read calculator settings"
  ON public.calculator_settings FOR SELECT
  USING (true);

CREATE POLICY "Content professionals can manage calculator settings"
  ON public.calculator_settings FOR ALL
  TO authenticated
  USING (public.can_edit_content(auth.uid()))
  WITH CHECK (public.can_edit_content(auth.uid()));

CREATE TRIGGER update_calculator_settings_updated_at
  BEFORE UPDATE ON public.calculator_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.calculator_settings (key, heading, description, disclaimer) VALUES
  ('bmi', 'BMI Calculator', 'Estimate your Body Mass Index to understand your weight category.', 'BMI is a general screening tool and does not account for muscle mass, body composition or individual health. Consult a physiotherapist for personalised advice.'),
  ('calorie', 'Calorie Calculator', 'Estimate your daily calorie needs based on your activity level.', 'Estimates use the Mifflin–St Jeor equation and are a starting point only. Individual needs vary — consult a professional before major changes.'),
  ('water', 'Water Intake Calculator', 'Estimate how much water you should drink each day.', 'General guidance only. Needs change with climate, activity and health conditions.'),
  ('protein', 'Protein Intake Calculator', 'Estimate your daily protein requirement for your goals.', 'General guidance only and not a substitute for individualised dietary advice.'),
  ('ideal_weight', 'Ideal Weight Calculator', 'Estimate a healthy weight range for your height.', 'Ideal weight formulas provide estimates only and do not reflect body composition or individual health.')
ON CONFLICT (key) DO NOTHING;
