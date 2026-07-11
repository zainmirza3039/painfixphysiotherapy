-- Lock down SECURITY DEFINER role helpers: not callable by anon/public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

-- Replace permissive public INSERT policies with validated checks
DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_submissions;
CREATE POLICY "Anyone can submit a contact message" ON public.contact_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(message) BETWEEN 1 AND 5000
    AND (email IS NULL OR char_length(email) <= 320)
    AND (phone IS NULL OR char_length(phone) <= 40)
  );

DROP POLICY IF EXISTS "Anyone can submit a home visit request" ON public.home_visit_requests;
CREATE POLICY "Anyone can submit a home visit request" ON public.home_visit_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 200
    AND char_length(phone) BETWEEN 1 AND 40
    AND char_length(address) BETWEEN 1 AND 1000
  );