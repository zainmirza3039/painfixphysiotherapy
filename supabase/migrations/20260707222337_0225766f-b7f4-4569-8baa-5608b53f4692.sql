CREATE POLICY "Anyone can upload a medical report"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'medical-reports');
CREATE POLICY "Staff can read medical reports"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'medical-reports');