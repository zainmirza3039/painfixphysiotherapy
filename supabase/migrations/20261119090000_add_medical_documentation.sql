-- PainFix medical documentation: additive schema only.
-- Apply only after preview review and explicit production approval.
-- Number allocation and issuance are server-owned; no client-side counters.

create table if not exists public.medical_document_sequences (
  document_type text primary key check (document_type in ('receipt', 'estimate', 'treatment_report', 'expense_statement')),
  last_number bigint not null default 0 check (last_number >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null,
  patient_id uuid not null references public.personal_patients(id) on delete restrict,
  document_type text not null check (document_type in ('receipt', 'estimate', 'treatment_report', 'expense_statement')),
  document_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'issued', 'cancelled', 'superseded')),
  patient_name_snapshot text not null,
  document_snapshot jsonb not null,
  verification_token_hash text not null unique,
  pdf_storage_path text,
  issued_at timestamptz,
  created_by uuid not null,
  supersedes_document_id uuid references public.medical_documents(id) on delete restrict,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medical_documents_issued_fields_check check (
    status <> 'issued' or (issued_at is not null and pdf_storage_path is not null)
  ),
  constraint medical_documents_token_hash_format check (verification_token_hash ~ '^[a-f0-9]{64}$')
);

create index if not exists medical_documents_patient_created_idx
  on public.medical_documents (patient_id, created_at desc);
create index if not exists medical_documents_clinician_created_idx
  on public.medical_documents (clinician_id, created_at desc);
create index if not exists medical_documents_type_status_idx
  on public.medical_documents (document_type, status, created_at desc);

create table if not exists public.medical_document_events (
  id uuid primary key default gen_random_uuid(),
  medical_document_id uuid not null references public.medical_documents(id) on delete restrict,
  actor_id uuid,
  event_type text not null check (event_type in ('created', 'issued', 'cancelled', 'superseded', 'pdf_failed')),
  event_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists medical_document_events_document_idx
  on public.medical_document_events (medical_document_id, created_at);

alter table public.medical_document_sequences enable row level security;
alter table public.medical_documents enable row level security;
alter table public.medical_document_events enable row level security;

-- No anon/authenticated grants or policies: all access is server-side.
revoke all on table public.medical_document_sequences from anon, authenticated;
revoke all on table public.medical_documents from anon, authenticated;
revoke all on table public.medical_document_events from anon, authenticated;
grant all on table public.medical_document_sequences to service_role;
grant all on table public.medical_documents to service_role;
grant all on table public.medical_document_events to service_role;

create or replace function public.reject_medical_document_history_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Medical document audit history is append-only';
end;
$$;

drop trigger if exists medical_document_events_no_update on public.medical_document_events;
create trigger medical_document_events_no_update
before update or delete on public.medical_document_events
for each row execute function public.reject_medical_document_history_mutation();

create or replace function public.guard_issued_medical_document()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'issued' then
    if new.id is distinct from old.id
      or new.clinician_id is distinct from old.clinician_id
      or new.patient_id is distinct from old.patient_id
      or new.document_type is distinct from old.document_type
      or new.document_number is distinct from old.document_number
      or new.patient_name_snapshot is distinct from old.patient_name_snapshot
      or new.document_snapshot is distinct from old.document_snapshot
      or new.verification_token_hash is distinct from old.verification_token_hash
      or new.pdf_storage_path is distinct from old.pdf_storage_path
      or new.issued_at is distinct from old.issued_at
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at then
      raise exception 'Issued medical document content is immutable';
    end if;
    if new.status not in ('issued', 'cancelled', 'superseded') then
      raise exception 'Invalid issued document lifecycle transition';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists medical_documents_guard_issued on public.medical_documents;
create trigger medical_documents_guard_issued
before update on public.medical_documents
for each row execute function public.guard_issued_medical_document();

create or replace function public.allocate_medical_document_number(p_document_type text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefix text;
  v_number bigint;
begin
  v_prefix := case p_document_type
    when 'receipt' then 'R'
    when 'estimate' then 'E'
    when 'treatment_report' then 'T'
    when 'expense_statement' then 'S'
    else null
  end;
  if v_prefix is null then
    raise exception 'Unsupported medical document type';
  end if;

  insert into public.medical_document_sequences (document_type, last_number)
  values (p_document_type, 1)
  on conflict (document_type) do update
    set last_number = public.medical_document_sequences.last_number + 1,
        updated_at = now()
  returning last_number into v_number;

  return 'PF-' || v_prefix || '-' || lpad(v_number::text, 5, '0');
end;
$$;

revoke all on function public.allocate_medical_document_number(text) from public, anon, authenticated;
grant execute on function public.allocate_medical_document_number(text) to service_role;

comment on table public.medical_documents is
  'Immutable clinical/financial document snapshots. Access only through authenticated server functions.';
comment on column public.medical_documents.verification_token_hash is
  'SHA-256 hex digest of a high-entropy raw verification token; never expose this field.';
comment on function public.allocate_medical_document_number(text) is
  'Atomically allocates a clinic-wide document number. Gaps are permitted; numbers are never reused.';
