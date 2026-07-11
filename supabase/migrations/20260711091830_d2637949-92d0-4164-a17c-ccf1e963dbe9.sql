-- =========================================================
-- ADMIN PANEL: ROLES, RBAC, SECURITY HARDENING, NEW TABLES
-- =========================================================

-- 1. ROLES ENUM + USER_ROLES ------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role checks (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'));
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 2. PATIENTS ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code text NOT NULL DEFAULT ('PF-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  name text NOT NULL,
  phone text,
  email text,
  age integer,
  gender text,
  address text,
  medical_condition text,
  diagnosis text,
  treatment_plan text,
  assigned_physiotherapist text,
  notes text,
  report_urls text[] NOT NULL DEFAULT '{}',
  follow_up_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff and admins can read patients" ON public.patients
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can insert patients" ON public.patients
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can update patients" ON public.patients
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete patients" ON public.patients
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Patient visit history
CREATE TABLE IF NOT EXISTS public.patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT current_date,
  therapist text,
  notes text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_visits TO authenticated;
GRANT ALL ON public.patient_visits TO service_role;
ALTER TABLE public.patient_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff and admins can read visits" ON public.patient_visits
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can write visits" ON public.patient_visits
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 3. APPOINTMENTS -----------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name text NOT NULL,
  phone text,
  email text,
  service text,
  appointment_at timestamptz,
  assigned_therapist text,
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff and admins can read appointments" ON public.appointments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can write appointments" ON public.appointments
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. BLOG POSTS (admin-managed) ---------------------------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  seo_title text,
  meta_description text,
  featured_image text,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  author text,
  status text NOT NULL DEFAULT 'draft',
  publish_at timestamptz,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT SELECT ON public.blog_posts TO anon;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
-- Public may read only published posts
CREATE POLICY "Public can read published posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));
CREATE POLICY "Admins can read all posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can write posts" ON public.blog_posts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. CLINIC SETTINGS (admin only) -------------------------
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_settings TO service_role;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read settings" ON public.clinic_settings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can write settings" ON public.clinic_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_clinic_settings_updated BEFORE UPDATE ON public.clinic_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. SECURITY HARDENING: contact_submissions -------------
-- Remove permissive staff read (USING true); restrict reads to admins.
DROP POLICY IF EXISTS "Staff can read contact messages" ON public.contact_submissions;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unread';
CREATE POLICY "Admins can read contact messages" ON public.contact_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contact messages" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contact messages" ON public.contact_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. SECURITY HARDENING: home_visit_requests -------------
DROP POLICY IF EXISTS "Staff can read home visit requests" ON public.home_visit_requests;
ALTER TABLE public.home_visit_requests ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.home_visit_requests ADD COLUMN IF NOT EXISTS assigned_therapist text;
ALTER TABLE public.home_visit_requests ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.home_visit_requests ADD COLUMN IF NOT EXISTS admin_notes text;
CREATE POLICY "Staff and admins can read home visits" ON public.home_visit_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff and admins can update home visits" ON public.home_visit_requests
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete home visits" ON public.home_visit_requests
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. STORAGE: medical-reports readable only by staff/admin
DROP POLICY IF EXISTS "Staff can read medical reports" ON storage.objects;
CREATE POLICY "Staff can read medical reports" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff can manage medical reports" ON storage.objects;
CREATE POLICY "Staff can manage medical reports" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'medical-reports' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'medical-reports' AND public.is_staff(auth.uid()));