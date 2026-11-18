-- Medical documentation foundation. Additive only; apply only after preview approval.
-- All access is server-mediated through the service role. No browser table grants.

begin;

create table if not exists public.medical_document_sequences (
  document_type text primary key check (document_type in ('receipt','estimate','treatment_report','expense_statement')),
  last_number bigint not null default 0 check (last_number >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  document_type text not null check (document_type in ('receipt','estimate','treatment_report','expense_statement')),
  document_number text not null unique,
  status text not null default 'pending' check (status in ('pending','issued','cancelled','superseded')),
  patient_name_snapshot text not null check (length(trim(patient_name_snapshot)) between 1 and 200),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  verification_token_hash text not null unique check (verification_token_hash ~ '^[a-f0-9]{64}$'),
  pdf_storage_path text unique,
  issued_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  supersedes_document_id uuid references public.medical_documents(id) on delete restrict,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint medical_documents_patient_owner_fkey
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id) on delete restrict,
  constraint medical_documents_number_format check (
    (document_type = 'receipt' and document_number ~ '^PF-R-[0-9]{5,}$') or
    (document_type = 'estimate' and document_number ~ '^PF-E-[0-9]{5,}$') or
    (document_type = 'treatment_report' and document_number ~ '^PF-T-[0-9]{5,}$') or
    (document_type = 'expense_statement' and document_number ~ '^PF-S-[0-9]{5,}$')
  ),
  constraint medical_documents_issued_fields check (
    status <> 'issued' or (issued_at is not null and pdf_storage_path is not null)
  ),
  constraint medical_documents_cancel_reason check (
    status <> 'cancelled' or (cancelled_at is not null and nullif(trim(cancellation_reason), '') is not null)
  )
);

create table if not exists public.medical_document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.medical_documents(id) on delete restrict,
  actor_id uuid references auth.users(id) on delete restrict,
  event_type text not null check (event_type in ('created_pending','issued','cancelled','superseded','pdf_replaced')),
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('medical-documents', 'medical-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

create index if not exists medical_documents_clinician_created_idx
  on public.medical_documents (clinician_id, created_at desc);
create index if not exists medical_documents_patient_created_idx
  on public.medical_documents (patient_id, created_at desc);
create index if not exists medical_document_events_document_created_idx
  on public.medical_document_events (document_id, created_at desc);

alter table public.medical_document_sequences enable row level security;
alter table public.medical_documents enable row level security;
alter table public.medical_document_events enable row level security;

revoke all on public.medical_document_sequences from public, anon, authenticated;
revoke all on public.medical_documents from public, anon, authenticated;
revoke all on public.medical_document_events from public, anon, authenticated;
grant all on public.medical_document_sequences to service_role;
grant all on public.medical_documents to service_role;
grant all on public.medical_document_events to service_role;

create or replace function public.guard_medical_document_immutability()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if old.status <> new.status and not (
       (old.status = 'pending' and new.status in ('issued','cancelled'))
       or (old.status = 'issued' and new.status = 'superseded')
     ) then
    raise exception 'Invalid medical document status transition';
  end if;
  if old.pdf_storage_path is not null and old.pdf_storage_path is distinct from new.pdf_storage_path then
    raise exception 'Stored PDF path is immutable once assigned';
  end if;
  if old.issued_at is not null and old.issued_at is distinct from new.issued_at then
    raise exception 'Issue timestamp is immutable once assigned';
  end if;
  if old.clinician_id is distinct from new.clinician_id
     or old.patient_id is distinct from new.patient_id
     or old.document_type is distinct from new.document_type
     or old.document_number is distinct from new.document_number
     or old.patient_name_snapshot is distinct from new.patient_name_snapshot
     or old.snapshot is distinct from new.snapshot
     or old.verification_token_hash is distinct from new.verification_token_hash
     or old.created_by is distinct from new.created_by
     or old.created_at is distinct from new.created_at
     or old.supersedes_document_id is distinct from new.supersedes_document_id then
    raise exception 'Issued document source fields are immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists medical_documents_immutable_fields on public.medical_documents;
create trigger medical_documents_immutable_fields
before update on public.medical_documents
for each row execute function public.guard_medical_document_immutability();

create or replace function public.reject_medical_document_event_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  raise exception 'Medical document events are append-only';
end;
$$;

drop trigger if exists medical_document_events_immutable on public.medical_document_events;
create trigger medical_document_events_immutable
before update or delete on public.medical_document_events
for each row execute function public.reject_medical_document_event_mutation();

-- Atomic sequence allocation + pending snapshot + audit event.
create or replace function public.begin_medical_document_issuance(
  p_clinician_id uuid,
  p_patient_id uuid,
  p_document_type text,
  p_patient_name_snapshot text,
  p_snapshot jsonb,
  p_token_hash text,
  p_actor_id uuid,
  p_supersedes_document_id uuid default null
)
returns table(document_id uuid, document_number text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_prefix text;
  v_number bigint;
  v_doc_number text;
  v_document_id uuid;
  v_patient_name text;
begin
  if p_actor_id is null or not (
    coalesce(public.has_role(p_actor_id, 'admin'), false)
    or coalesce(public.has_role(p_actor_id, 'super_admin'), false)
  ) then
    raise exception 'Administrator access required';
  end if;

  if p_document_type not in ('receipt','estimate','treatment_report','expense_statement') then
    raise exception 'Unsupported document type';
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'A document snapshot is required';
  end if;
  if p_token_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid verification token digest';
  end if;

  select pp.full_name into v_patient_name
  from public.personal_patients pp
  where pp.id = p_patient_id and pp.clinician_id = p_clinician_id;
  if not found then
    raise exception 'Patient not found for this clinician';
  end if;
  if trim(coalesce(p_patient_name_snapshot,'')) <> trim(v_patient_name) then
    raise exception 'Patient name snapshot does not match the patient record';
  end if;

  v_prefix := case p_document_type
    when 'receipt' then 'PF-R-'
    when 'estimate' then 'PF-E-'
    when 'treatment_report' then 'PF-T-'
    else 'PF-S-'
  end;

  insert into public.medical_document_sequences(document_type, last_number)
  values (p_document_type, 1)
  on conflict (document_type) do update
    set last_number = public.medical_document_sequences.last_number + 1,
        updated_at = now()
  returning last_number into v_number;

  v_doc_number := v_prefix || lpad(v_number::text, 5, '0');

  insert into public.medical_documents(
    clinician_id, patient_id, document_type, document_number, patient_name_snapshot,
    snapshot, verification_token_hash, created_by, supersedes_document_id
  ) values (
    p_clinician_id, p_patient_id, p_document_type, v_doc_number, trim(p_patient_name_snapshot),
    p_snapshot, p_token_hash, p_actor_id, p_supersedes_document_id
  ) returning id into v_document_id;

  insert into public.medical_document_events(document_id, actor_id, event_type, details)
  values (v_document_id, p_actor_id, 'created_pending', jsonb_build_object('document_type', p_document_type));

  return query select v_document_id, v_doc_number;
end;
$$;

revoke all on function public.begin_medical_document_issuance(uuid,uuid,text,text,jsonb,text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.begin_medical_document_issuance(uuid,uuid,text,text,jsonb,text,uuid,uuid) to service_role;


-- Finalize only a pending record after the private PDF upload succeeds.
create or replace function public.complete_medical_document_issuance(
  p_document_id uuid, p_pdf_storage_path text, p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_doc public.medical_documents%rowtype;
begin
  if p_actor_id is null or not (
    coalesce(public.has_role(p_actor_id, 'admin'), false)
    or coalesce(public.has_role(p_actor_id, 'super_admin'), false)
  ) then
    raise exception 'Administrator access required';
  end if;
  if p_pdf_storage_path is null
     or p_pdf_storage_path !~ '^medical-documents/[0-9a-f-]{36}/[0-9a-f-]{36}[.]pdf$' then
    raise exception 'Invalid private PDF storage path';
  end if;
  select * into v_doc from public.medical_documents where id = p_document_id for update;
  if not found or v_doc.status <> 'pending' then
    raise exception 'Pending document not found';
  end if;
  update public.medical_documents
    set status = 'issued', issued_at = now(), pdf_storage_path = p_pdf_storage_path
    where id = p_document_id;
  insert into public.medical_document_events(document_id, actor_id, event_type, details)
    values (p_document_id, p_actor_id, 'issued', jsonb_build_object('pdf_stored', true));
end;
$function$;

create or replace function public.cancel_medical_document_issuance(
  p_document_id uuid, p_reason text, p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_doc public.medical_documents%rowtype;
begin
  if p_actor_id is null or not (
    coalesce(public.has_role(p_actor_id, 'admin'), false)
    or coalesce(public.has_role(p_actor_id, 'super_admin'), false)
  ) then
    raise exception 'Administrator access required';
  end if;
  if length(trim(coalesce(p_reason,''))) < 8 or length(p_reason) > 500 then
    raise exception 'A cancellation reason of 8-500 characters is required';
  end if;
  select * into v_doc from public.medical_documents where id = p_document_id for update;
  if not found or v_doc.status <> 'pending' then
    raise exception 'Pending document not found';
  end if;
  update public.medical_documents
    set status = 'cancelled', cancelled_at = now(), cancellation_reason = trim(p_reason)
    where id = p_document_id;
  insert into public.medical_document_events(document_id, actor_id, event_type, details)
    values (p_document_id, p_actor_id, 'cancelled', jsonb_build_object('reason', trim(p_reason)));
end;
$function$;

revoke all on function public.complete_medical_document_issuance(uuid,text,uuid) from public, anon, authenticated;
revoke all on function public.cancel_medical_document_issuance(uuid,text,uuid) from public, anon, authenticated;
grant execute on function public.complete_medical_document_issuance(uuid,text,uuid) to service_role;
grant execute on function public.cancel_medical_document_issuance(uuid,text,uuid) to service_role;

commit;
