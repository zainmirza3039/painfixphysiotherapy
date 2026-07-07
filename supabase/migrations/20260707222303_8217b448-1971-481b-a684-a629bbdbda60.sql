CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a contact message"
  ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read contact messages"
  ON public.contact_submissions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.home_visit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  maps_location text,
  patient_age integer,
  medical_condition text,
  preferred_date date,
  preferred_time text,
  report_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.home_visit_requests TO anon;
GRANT SELECT, INSERT ON public.home_visit_requests TO authenticated;
GRANT ALL ON public.home_visit_requests TO service_role;
ALTER TABLE public.home_visit_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a home visit request"
  ON public.home_visit_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read home visit requests"
  ON public.home_visit_requests FOR SELECT TO authenticated USING (true);