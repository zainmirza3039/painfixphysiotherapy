create table if not exists public.personal_patient_treatment_documents (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  document_number text not null unique,
  verification_token_hash text not null unique check (verification_token_hash ~ '^[a-f0-9]{64}$'),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  public_snapshot jsonb not null check (jsonb_typeof(public_snapshot) = 'object'),
  status text not null default 'valid' check (status in ('valid','revoked','superseded')),
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_reason text,
  constraint personal_patient_treatment_document_owner_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id) on delete restrict
);

create index if not exists personal_patient_treatment_documents_owner_idx
  on public.personal_patient_treatment_documents(clinician_id, patient_id, issued_at desc);

alter table public.personal_patient_treatment_documents enable row level security;

create policy "Clinicians read their own treatment documents"
on public.personal_patient_treatment_documents for select to authenticated
using ((select auth.uid()) = clinician_id);

create policy "Clinicians revoke their own treatment documents"
on public.personal_patient_treatment_documents for update to authenticated
using ((select auth.uid()) = clinician_id and status = 'valid')
with check (
  (select auth.uid()) = clinician_id
  and status = 'revoked'
  and revoked_at is not null
  and revoked_reason is not null
);

create or replace function public.guard_personal_patient_treatment_document()
returns trigger
language plpgsql
set search_path = public, extensions, pg_temp
as $guard$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'valid'
      or new.revoked_at is not null
      or new.revoked_reason is not null
      or new.snapshot->>'documentNumber' is distinct from new.document_number
      or new.snapshot->>'verificationToken' is null
      or new.snapshot->>'verificationToken' !~ '^[a-f0-9]{64}$'
      or encode(digest(new.snapshot->>'verificationToken', 'sha256'), 'hex') is distinct from new.verification_token_hash then
      raise exception 'Invalid treatment document snapshot or verification token.';
    end if;
    return new;
  end if;

  if new.id is distinct from old.id
    or new.clinician_id is distinct from old.clinician_id
    or new.patient_id is distinct from old.patient_id
    or new.document_number is distinct from old.document_number
    or new.verification_token_hash is distinct from old.verification_token_hash
    or new.snapshot is distinct from old.snapshot
    or new.public_snapshot is distinct from old.public_snapshot
    or new.issued_at is distinct from old.issued_at then
    raise exception 'Issued treatment document snapshots are immutable.';
  end if;

  if old.status <> 'valid'
    or new.status <> 'revoked'
    or new.revoked_at is null
    or nullif(btrim(new.revoked_reason), '') is null then
    raise exception 'Only a valid document can be revoked, with a recorded reason.';
  end if;
  return new;
end;
$guard$;

drop trigger if exists personal_patient_treatment_document_guard on public.personal_patient_treatment_documents;
create trigger personal_patient_treatment_document_guard
before insert or update on public.personal_patient_treatment_documents
for each row execute function public.guard_personal_patient_treatment_document();

