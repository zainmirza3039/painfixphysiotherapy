-- Ensure a payment can be reversed only once, even if two browser sessions
-- submit the action concurrently. The original payment row remains immutable.
create unique index if not exists personal_patient_payment_reversal_reference_uidx
  on public.personal_patient_ledger (clinician_id, reference)
  where reference like 'payment-reversal:%';
