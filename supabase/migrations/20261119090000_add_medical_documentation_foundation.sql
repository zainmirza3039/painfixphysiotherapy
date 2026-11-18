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

create index if not exists medical_document_receipt_payment_once_idx
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

    -- Serialize receipt creation on the underlying payment rows. A payment can
    -- have one active receipt, while a cancelled/superseded receipt may be replaced.
    perform l.id
    from public.personal_patient_ledger l
    where l.id = any(p_source_ids)
      and l.clinician_id = p_clinician_id
      and l.patient_id = p_patient_id
    order by l.id
    for update;

    if exists (
      select 1
      from public.medical_document_source_items si
      join public.medical_documents existing on existing.id = si.document_id
      where si.source_id = any(p_source_ids)
        and si.document_type = 'receipt'
        and si.source_kind = 'payment_ledger'
        and existing.status in ('pending', 'issued')
        and existing.id is distinct from p_supersedes_document_id
    ) then
      raise exception 'One or more payments already belong to an active receipt';
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
  select * into v_doc from public.medical_documents where id = p_document_id for update;
  if not found or v_doc.status <> 'pending' then
    raise exception 'Pending document not found';
  end if;
  if v_doc.clinician_id is distinct from p_actor_id then
    raise exception 'Document owner does not match administrator';
  end if;
  if p_pdf_storage_path is null
     or p_pdf_storage_path <> 'medical-documents/' || v_doc.patient_id::text || '/' || v_doc.id::text || '.pdf' then
    raise exception 'Invalid private PDF storage path';
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
  if v_doc.clinician_id is distinct from p_actor_id then
    raise exception 'Document owner does not match administrator';
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


-- Patient portal PIN verification and session validation.
-- These routines are service-role-only; portal credential/session tables remain closed to browser roles.
create or replace function public.verify_personal_patient_portal_pin(
  p_token_digest text,
  p_pin_digest text,
  p_session_digest text,
  p_expires_at timestamptz
)
returns table(verified boolean, session_expires_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_credential public.personal_patient_portal_credentials%rowtype;
  v_attempts integer;
begin
  if p_token_digest is null or p_pin_digest is null or p_session_digest is null
     or p_token_digest !~ '^[a-f0-9]{64}$'
     or p_pin_digest !~ '^[a-f0-9]{64}$'
     or p_session_digest !~ '^[a-f0-9]{64}$'
     or p_expires_at is null
     or p_expires_at <= now()
     or p_expires_at > now() + interval '2 hours' then
    raise exception 'Invalid portal verification request';
  end if;

  select c.* into v_credential
  from public.personal_patient_portal_credentials c
  join public.personal_patients p
    on p.id = c.patient_id and p.clinician_id = c.clinician_id
  where c.token_digest = p_token_digest
    and p.archived_at is null
  for update of c;

  if not found or v_credential.is_revoked
     or (v_credential.locked_until is not null and v_credential.locked_until > now()) then
    return query select false, null::timestamptz;
    return;
  end if;

  if v_credential.pin_hash = p_pin_digest then
    update public.personal_patient_portal_credentials
      set failed_attempts = 0, locked_until = null, last_accessed_at = now(), updated_at = now()
      where patient_id = v_credential.patient_id;

    insert into public.personal_patient_portal_sessions(
      patient_id, clinician_id, session_token_digest, expires_at
    ) values (
      v_credential.patient_id, v_credential.clinician_id, p_session_digest, p_expires_at
    );

    return query select true, p_expires_at;
    return;
  end if;

  v_attempts := v_credential.failed_attempts + 1;
  update public.personal_patient_portal_credentials
    set failed_attempts = v_attempts,
        locked_until = case when v_attempts >= 8 then now() + interval '30 minutes' else locked_until end,
        updated_at = now()
    where patient_id = v_credential.patient_id;

  return query select false, null::timestamptz;
end;
$$;

create or replace function public.resolve_personal_patient_portal_session(
  p_session_digest text
)
returns table(patient_id uuid, clinician_id uuid)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_session public.personal_patient_portal_sessions%rowtype;
  v_credential public.personal_patient_portal_credentials%rowtype;
begin
  if p_session_digest is null or p_session_digest !~ '^[a-f0-9]{64}$' then
    return;
  end if;

  -- Lock credential before session. PIN verification and credential management use this order.
  select * into v_session
  from public.personal_patient_portal_sessions s
  where s.session_token_digest = p_session_digest
    and s.expires_at > now()
    and s.revoked_at is null;

  if not found then
    return;
  end if;

  select c.* into v_credential
  from public.personal_patient_portal_credentials c
  join public.personal_patients p
    on p.id = c.patient_id and p.clinician_id = c.clinician_id
  where c.patient_id = v_session.patient_id
    and c.clinician_id = v_session.clinician_id
    and p.archived_at is null
  for update of c;

  if not found or v_credential.is_revoked then
    return;
  end if;

  select * into v_session
  from public.personal_patient_portal_sessions s
  where s.id = v_session.id
    and s.expires_at > now()
    and s.revoked_at is null
  for update;

  if not found then
    return;
  end if;

  update public.personal_patient_portal_credentials
    set last_accessed_at = now()
    where patient_id = v_session.patient_id;

  return query select v_session.patient_id, v_session.clinician_id;
end;
$$;

create or replace function public.get_personal_patient_portal_summary(
  p_patient_id uuid,
  p_clinician_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_plan public.personal_patient_plans%rowtype;
  v_completed integer;
  v_upcoming integer;
  v_total_charges numeric;
  v_total_received numeric;
  v_balance numeric;
  v_remaining integer;
  v_next jsonb;
begin
  if p_patient_id is null or p_clinician_id is null then
    raise exception 'Patient and clinician identity are required';
  end if;
  if not exists (
    select 1 from public.personal_patients p
    where p.id = p_patient_id and p.clinician_id = p_clinician_id
      and p.archived_at is null
  ) then
    raise exception 'Patient account not found';
  end if;

  select * into v_plan
  from public.personal_patient_plans p
  where p.patient_id = p_patient_id and p.clinician_id = p_clinician_id
    and p.is_active = true
  order by p.created_at desc
  limit 1;

  select count(*)::integer into v_completed
  from public.personal_patient_sessions s
  where s.patient_id = p_patient_id and s.clinician_id = p_clinician_id
    and s.status = 'completed';

  select count(*)::integer into v_upcoming
  from public.personal_patient_sessions s
  where s.patient_id = p_patient_id and s.clinician_id = p_clinician_id
    and s.status = 'scheduled' and s.session_date >= now();

  select coalesce(sum(case when l.entry_type = 'charge' then l.amount else 0 end), 0),
         coalesce(sum(case when l.entry_type = 'payment' then abs(l.amount) else 0 end), 0),
         coalesce(sum(l.amount), 0)
    into v_total_charges, v_total_received, v_balance
  from public.personal_patient_ledger l
  where l.patient_id = p_patient_id and l.clinician_id = p_clinician_id;

  if v_plan.id is not null and v_plan.plan_type = 'package' and v_plan.package_sessions is not null then
    select greatest(0, v_plan.package_sessions - count(*)::integer)
      into v_remaining
    from public.personal_patient_sessions s
    where s.patient_id = p_patient_id and s.clinician_id = p_clinician_id
      and s.plan_id = v_plan.id and s.status = 'completed';
  else
    v_remaining := null;
  end if;

  select jsonb_build_object('session_date', s.session_date, 'session_label', s.session_label)
    into v_next
  from public.personal_patient_sessions s
  where s.patient_id = p_patient_id and s.clinician_id = p_clinician_id
    and s.status = 'scheduled' and s.session_date >= now()
  order by s.session_date asc
  limit 1;

  return jsonb_build_object(
    'completedSessions', v_completed,
    'upcomingSessions', v_upcoming,
    'totalCharges', v_total_charges,
    'totalReceived', v_total_received,
    'outstandingDues', greatest(0, v_balance),
    'advanceCredit', greatest(0, -v_balance),
    'packageSessionsRemaining', v_remaining,
    'nextSession', v_next
  );
end;
$$;

create or replace function public.manage_personal_patient_portal(
  p_clinician_id uuid,
  p_patient_id uuid,
  p_action text,
  p_token_digest text default null,
  p_pin_hash text default null
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_now timestamptz := now();
begin
  if p_clinician_id is null or p_patient_id is null then
    raise exception 'Clinician and patient identity are required';
  end if;
  if not (
    coalesce(public.has_role(p_clinician_id, 'admin'), false)
    or coalesce(public.has_role(p_clinician_id, 'super_admin'), false)
  ) then
    raise exception 'Administrator access required';
  end if;
  if not exists (
    select 1 from public.personal_patients p
    where p.id = p_patient_id and p.clinician_id = p_clinician_id
      and p.archived_at is null
  ) then
    raise exception 'Patient account not found';
  end if;

  if p_action = 'revoke' then
    update public.personal_patient_portal_credentials
      set is_revoked = true, failed_attempts = 0, locked_until = null, updated_at = v_now
      where patient_id = p_patient_id and clinician_id = p_clinician_id;
    update public.personal_patient_portal_sessions
      set revoked_at = v_now
      where patient_id = p_patient_id and clinician_id = p_clinician_id and revoked_at is null;
    insert into public.personal_patient_audit_events(
      clinician_id, patient_id, entity_type, entity_id, action, details
    ) values (
      p_clinician_id, p_patient_id, 'portal', p_patient_id, 'portal_revoked',
      jsonb_build_object('revoked_at', v_now)
    );
  elsif p_action = 'create_or_rotate' then
    if p_token_digest is null or p_pin_hash is null
       or p_token_digest !~ '^[a-f0-9]{64}$'
       or p_pin_hash !~ '^[a-f0-9]{64}$' then
      raise exception 'Invalid portal credentials';
    end if;

    -- Match the credential-before-session lock order used by verification.
    perform 1
    from public.personal_patient_portal_credentials c
    where c.patient_id = p_patient_id and c.clinician_id = p_clinician_id
    for update;

    update public.personal_patient_portal_sessions
      set revoked_at = v_now
      where patient_id = p_patient_id and clinician_id = p_clinician_id and revoked_at is null;

    insert into public.personal_patient_portal_credentials(
      patient_id, clinician_id, token_digest, pin_hash, is_revoked,
      failed_attempts, locked_until, updated_at
    ) values (
      p_patient_id, p_clinician_id, p_token_digest, p_pin_hash, false, 0, null, v_now
    )
    on conflict (patient_id) do update set
      clinician_id = excluded.clinician_id,
      token_digest = excluded.token_digest,
      pin_hash = excluded.pin_hash,
      is_revoked = false,
      failed_attempts = 0,
      locked_until = null,
      updated_at = v_now;

    insert into public.personal_patient_audit_events(
      clinician_id, patient_id, entity_type, entity_id, action, details
    ) values (
      p_clinician_id, p_patient_id, 'portal', p_patient_id, 'portal_created_or_rotated',
      jsonb_build_object('created_at', v_now)
    );
  else
    raise exception 'Unsupported portal action';
  end if;
end;
$$;

revoke all on function public.verify_personal_patient_portal_pin(text,text,text,timestamptz)
  from public, anon, authenticated;
revoke all on function public.resolve_personal_patient_portal_session(text)
  from public, anon, authenticated;
revoke all on function public.get_personal_patient_portal_summary(uuid,uuid)
  from public, anon, authenticated;
revoke all on function public.manage_personal_patient_portal(uuid,uuid,text,text,text)
  from public, anon, authenticated;
grant execute on function public.verify_personal_patient_portal_pin(text,text,text,timestamptz)
  to service_role;
grant execute on function public.resolve_personal_patient_portal_session(text)
  to service_role;
grant execute on function public.get_personal_patient_portal_summary(uuid,uuid)
  to service_role;
grant execute on function public.manage_personal_patient_portal(uuid,uuid,text,text,text)
  to service_role;

-- Per-client public verification throttling. Only a keyed digest is persisted, never the raw IP.
create table if not exists public.medical_document_verification_limits (
  ip_digest text primary key check (ip_digest ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.medical_document_verification_limits enable row level security;
revoke all on public.medical_document_verification_limits from public, anon, authenticated;
grant all on public.medical_document_verification_limits to service_role;

create or replace function public.consume_medical_document_verification_limit(
  p_ip_digest text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  if p_ip_digest is null or p_ip_digest !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid verification throttle key';
  end if;

  insert into public.medical_document_verification_limits(
    ip_digest, window_started_at, request_count, updated_at
  ) values (p_ip_digest, now(), 1, now())
  on conflict (ip_digest) do update set
    window_started_at = case
      when public.medical_document_verification_limits.window_started_at <= now() - interval '15 minutes'
        then now()
      else public.medical_document_verification_limits.window_started_at
    end,
    request_count = case
      when public.medical_document_verification_limits.window_started_at <= now() - interval '15 minutes'
        then 1
      else public.medical_document_verification_limits.request_count + 1
    end,
    updated_at = now()
  returning request_count into v_count;

  return v_count <= 20;
end;
$$;

create or replace function public.cancel_stale_medical_document_issuances(
  p_clinician_id uuid,
  p_actor_id uuid
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_doc public.medical_documents%rowtype;
  v_cancelled integer := 0;
  v_reason constant text := 'Automatically cancelled after 30 minutes without finalization.';
begin
  if p_actor_id is null or p_clinician_id is distinct from p_actor_id
     or not (
       coalesce(public.has_role(p_actor_id, 'admin'), false)
       or coalesce(public.has_role(p_actor_id, 'super_admin'), false)
     ) then
    raise exception 'Administrator access required';
  end if;

  for v_doc in
    select d.*
    from public.medical_documents d
    where d.clinician_id = p_clinician_id
      and d.status = 'pending'
      and d.created_at < now() - interval '30 minutes'
    order by d.created_at
    for update
  loop
    update public.medical_documents
      set status = 'cancelled', cancelled_at = now(), cancellation_reason = v_reason
      where id = v_doc.id;
    insert into public.medical_document_events(document_id, actor_id, event_type, details)
      values (v_doc.id, p_actor_id, 'cancelled', jsonb_build_object('reason', v_reason));
    v_cancelled := v_cancelled + 1;
  end loop;

  return v_cancelled;
end;
$$;

revoke all on function public.consume_medical_document_verification_limit(text)
  from public, anon, authenticated;
revoke all on function public.cancel_stale_medical_document_issuances(uuid,uuid)
  from public, anon, authenticated;
grant execute on function public.consume_medical_document_verification_limit(text)
  to service_role;
grant execute on function public.cancel_stale_medical_document_issuances(uuid,uuid)
  to service_role;

commit;
