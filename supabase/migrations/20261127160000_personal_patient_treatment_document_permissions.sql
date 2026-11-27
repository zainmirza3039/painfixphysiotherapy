-- The certificate table is protected by RLS, but RLS does not grant
-- table privileges. Clinicians need SELECT for the issued-document list
-- and UPDATE for the guarded revocation flow. Issuance remains service-role only.
revoke all on public.personal_patient_treatment_documents from anon;
grant select, update on public.personal_patient_treatment_documents to authenticated;
