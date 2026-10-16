-- Home Visit security and current admin workflow repair.
-- This migration is intentionally limited to the live table and the role helpers
-- used by its RLS policies; it does not apply unrelated historical migrations.

ALTER TABLE public.home_visit_requests
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

ALTER TABLE public.home_visit_requests ENABLE ROW LEVEL SECURITY;

-- Public form submissions may populate only fields the form actually collects.
-- In particular, anon cannot set internal status or existing admin metadata.
REVOKE ALL PRIVILEGES ON TABLE public.home_visit_requests FROM anon;
GRANT INSERT (full_name, phone, address, medical_condition, preferred_date, preferred_time, notes)
  ON TABLE public.home_visit_requests TO anon;

-- The admin UI reads requests, updates only status, and deletes only for admins.
REVOKE ALL PRIVILEGES ON TABLE public.home_visit_requests FROM authenticated;
GRANT SELECT, DELETE ON TABLE public.home_visit_requests TO authenticated;
GRANT INSERT (full_name, phone, address, medical_condition, preferred_date, preferred_time, notes)
  ON TABLE public.home_visit_requests TO authenticated;
GRANT UPDATE (status) ON TABLE public.home_visit_requests TO authenticated;

-- These invoker helpers are used by authenticated RLS policies. Keep
-- authenticated/service-role access but remove default PUBLIC/anon execution.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can submit a home visit request" ON public.home_visit_requests;
CREATE POLICY "Anyone can submit a home visit request"
  ON public.home_visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(btrim(full_name)) BETWEEN 1 AND 200
    AND char_length(btrim(phone)) BETWEEN 1 AND 40
    AND char_length(btrim(address)) BETWEEN 1 AND 1000
    AND char_length(btrim(coalesce(medical_condition, ''))) BETWEEN 1 AND 200
    AND preferred_date IS NOT NULL
    AND preferred_date >= current_date
    AND char_length(btrim(coalesce(preferred_time, ''))) BETWEEN 1 AND 20
    AND (notes IS NULL OR char_length(notes) <= 1000)
  );

DROP POLICY IF EXISTS "Staff can read home visit requests" ON public.home_visit_requests;
DROP POLICY IF EXISTS "Staff and admins can read home visits" ON public.home_visit_requests;
CREATE POLICY "Staff and admins can read home visits"
  ON public.home_visit_requests
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff and admins can update home visits" ON public.home_visit_requests;
CREATE POLICY "Staff and admins can update home visits"
  ON public.home_visit_requests
  FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins can delete home visits" ON public.home_visit_requests;
CREATE POLICY "Admins can delete home visits"
  ON public.home_visit_requests
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );
