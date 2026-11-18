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

create table if not exists public.medical_document_source_items (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.medical_documents(id) on delete restrict,
  document_type text not null check (document_type in ('receipt','estimate','treatment_report','expense_statement')),
  source_kind text not null check (source_kind in ('payment_ledger','statement_ledger','completed_session','estimate_document')),
  source_id uuid not null,
  created_at timestamptz not null default now()
);

create unique index if not exists medical_document_receipt_payment_once_idx
  on public.medical_document_source_items (source_id)
  where document_type = 'receipt' and source_kind = 'payment_ledger';

create index if not exists medical_document_source_items_document_idx
  on public.medical_document_source_items (document_id);

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
alter table public.medical_document_source_items enable row level security;

revoke all on public.medical_document_sequences from public, anon, authenticated;
revoke all on public.medical_documents from public, anon, authenticated;
revoke all on public.medical_document_events from public, anon, authenticated;
revoke all on public.medical_document_source_items from public, anon, authenticated;
grant all on public.medical_document_sequences to service_role;
grant all on public.medical_documents to service_role;
grant all on public.medical_document_events to service_role;
grant all on public.medical_document_source_items to service_role;

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
  p_supersedes_document_id uuid default null,
  p_source_ids uuid[] default null
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
  v_source_count bigint;
  v_inserted_count bigint;
begin
  if p_actor_id is null or not (
    coalesce(public.has_role(p_actor_id, 'admin'), false)
    or coalesce(public.has_role(p_actor_id, 'super_admin'), false)
  ) then
    raise exception 'Administrator access required';
  end if;

  if p_clinician_id is distinct from p_actor_id then
    raise exception 'Documents can only be issued for the authenticated clinician';
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

  if p_supersedes_document_id is not null and not exists (
    select 1 from public.medical_documents prior
    where prior.id = p_supersedes_document_id
      and prior.clinician_id = p_clinician_id
      and prior.patient_id = p_patient_id
      and prior.document_type = p_document_type
      and prior.status = 'issued'
  ) then
    raise exception 'Replacement must reference an issued document of the same patient and type';
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

  if p_document_type = 'receipt' then
    if coalesce(cardinality(p_source_ids), 0) = 0 then
      raise exception 'A receipt requires at least one recorded payment';
    end if;
    select count(*) into v_source_count
    from public.personal_patient_ledger l
    where l.id = any(p_source_ids)
      and l.clinician_id = p_clinician_id
      and l.patient_id = p_patient_id
      and l.entry_type = 'payment'
      and l.amount < 0;
    if v_source_count <> cardinality(p_source_ids) then
      raise exception 'Receipt sources must be payment entries for this patient';
    end if;
  elsif p_document_type = 'treatment_report' then
    if coalesce(cardinality(p_source_ids), 0) = 0 then
      raise exception 'A treatment report requires completed treatment sessions';
    end if;
    select count(*) into v_source_count
    from public.personal_patient_sessions s
    where s.id = any(p_source_ids)
      and s.clinician_id = p_clinician_id
      and s.patient_id = p_patient_id
      and s.status = 'completed';
    if v_source_count <> cardinality(p_source_ids) then
      raise exception 'Treatment report sources must be completed sessions for this patient';
    end if;
  elsif p_document_type = 'expense_statement' then
    if coalesce(cardinality(p_source_ids), 0) = 0 then
      raise exception 'An expense statement requires recorded financial entries';
    end if;
    select count(*) into v_source_count
    from public.personal_patient_ledger l
    where l.id = any(p_source_ids)
      and l.clinician_id = p_clinician_id
      and l.patient_id = p_patient_id
      and l.entry_type in ('payment','refund','adjustment');
    if v_source_count <> cardinality(p_source_ids) then
      raise exception 'Statement sources must be payment, refund or adjustment entries';
    end if;
  elsif coalesce(cardinality(p_source_ids), 0) > 0 then
    raise exception 'Treatment estimates must not reference payment ledger entries';
  end if;

  v_doc_number := v_prefix || lpad(v_number::text, 5, '0');

  insert into public.medical_documents(
    clinician_id, patient_id, document_type, document_number, patient_name_snapshot,
    snapshot, verification_token_hash, created_by, supersedes_document_id
  ) values (
    p_clinician_id, p_patient_id, p_document_type, v_doc_number, trim(p_patient_name_snapshot),
    p_snapshot, p_token_hash, p_actor_id, p_supersedes_document_id
  ) returning id into v_document_id;

  if coalesce(cardinality(p_source_ids), 0) > 0 then
    insert into public.medical_document_source_items(document_id, document_type, source_kind, source_id)
    select v_document_id, p_document_type,
      case
        when p_document_type = 'receipt' then 'payment_ledger'
        when p_document_type = 'treatment_report' then 'completed_session'
        else 'statement_ledger'
      end,
      source_id
    from unnest(p_source_ids) as source_id;
    get diagnostics v_inserted_count = row_count;
    if v_inserted_count <> cardinality(p_source_ids) then
      raise exception 'Unable to register all document source records';
    end if;
  end if;

  insert into public.medical_document_events(document_id, actor_id, event_type, details)
  values (v_document_id, p_actor_id, 'created_pending', jsonb_build_object('document_type', p_document_type));

  return query select v_document_id, v_doc_number;
end;
$$;

revoke all on function public.begin_medical_document_issuance(uuid,uuid,text,text,jsonb,text,uuid,uuid,uuid[]) from public, anon, authenticated;
grant execute on function public.begin_medical_document_issuance(uuid,uuid,text,text,jsonb,text,uuid,uuid,uuid[]) to service_role;


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
     or p_pdf_storage_path <> 'medical-documents/' || v_doc.patient_id::text || '/' || v_doc.id::text || '.pdf' then
    raise exception 'Invalid private PDF storage path';
  end if;
  select * into v_doc from public.medical_documents where id = p_document_id for update;
  if not found or v_doc.status <> 'pending' then
    raise exception 'Pending document not found';
  end if;
  if not exists (
    select 1 from storage.objects so
    where so.bucket_id = 'medical-documents'
      and so.name = v_doc.patient_id::text || '/' || v_doc.id::text || '.pdf'
  ) then
    raise exception 'Private PDF object is missing from storage';
  end if;

  update public.medical_documents
    set status = 'issued', issued_at = now(), pdf_storage_path = p_pdf_storage_path
    where id = p_document_id;
  insert into public.medical_document_events(document_id, actor_id, event_type, details)
    values (p_document_id, p_actor_id, 'issued', jsonb_build_object('pdf_stored', true));

  if v_doc.supersedes_document_id is not null then
    update public.medical_documents
      set status = 'superseded'
      where id = v_doc.supersedes_document_id
        and clinician_id = v_doc.clinician_id
        and patient_id = v_doc.patient_id
        and document_type = v_doc.document_type
        and status = 'issued';
    if not found then
      raise exception 'Prior issued document could not be superseded';
    end if;
    insert into public.medical_document_events(document_id, actor_id, event_type, details)
      values (v_doc.supersedes_document_id, p_actor_id, 'superseded', jsonb_build_object('replacement_document_id', p_document_id));
  end if;
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
