-- Atomic, owner-scoped import for the personal patient ledger.
-- A single RPC call is one PostgreSQL transaction: any validation or write error
-- rolls back every row in the submitted batch.
alter table public.personal_patient_portal_sessions enable row level security;

create unique index if not exists personal_patient_import_reference_uidx
  on public.personal_patient_ledger (clinician_id, reference)
  where reference like 'personal-patient-import:%';

create or replace function public.import_personal_patient_batch(
  p_rows jsonb,
  p_batch_id text
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_clinician uuid := auth.uid();
  v_row jsonb;
  v_name text;
  v_phone text;
  v_email text;
  v_patient uuid;
  v_plan uuid;
  v_title text;
  v_sessions integer;
  v_fee numeric(12,2);
  v_session_date timestamptz;
  v_session_id uuid;
  v_session_status text;
  v_session_label text;
  v_payment numeric(12,2);
  v_source_row integer;
  v_reference text;
  v_imported integer := 0;
begin
  if v_clinician is null then
    raise exception 'Authentication required.';
  end if;
  if p_batch_id is null or p_batch_id !~ '^[a-f0-9-]{36}$' then
    raise exception 'Invalid import batch identifier.';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) is distinct from 'array' or jsonb_array_length(p_rows) = 0 then
    raise exception 'Import must contain at least one patient row.';
  end if;
  if jsonb_array_length(p_rows) > 1000 then
    raise exception 'Import is limited to 1,000 rows per batch.';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_name := nullif(trim(v_row->>'name'), '');
    if v_name is null or length(v_name) > 160 then
      raise exception 'A row contains a missing or invalid patient name.';
    end if;
    v_phone := nullif(trim(v_row->>'phone'), '');
    v_email := nullif(trim(v_row->>'email'), '');
    v_title := nullif(trim(v_row->>'packageTitle'), '');
    v_sessions := nullif(v_row->>'packageSessions', '')::integer;
    v_fee := nullif(v_row->>'packageFee', '')::numeric(12,2);
    v_session_date := nullif(v_row->>'sessionDate', '')::timestamptz;
    v_session_status := nullif(v_row->>'sessionStatus', '');
    v_session_label := nullif(trim(v_row->>'sessionLabel'), '');
    v_payment := nullif(v_row->>'payment', '')::numeric(12,2);
    v_source_row := coalesce(nullif(v_row->>'sourceRow', '')::integer, 0);

    if v_sessions is not null and v_sessions <= 0 then
      raise exception 'Package session count must be greater than zero.';
    end if;
    if v_fee is not null and v_fee < 0 then
      raise exception 'Package fee cannot be negative.';
    end if;
    if v_payment is not null and v_payment < 0 then
      raise exception 'Payment cannot be negative.';
    end if;
    if v_session_status is not null and v_session_status not in ('scheduled','completed','cancelled','rescheduled') then
      v_session_status := null;
    end if;

    v_patient := null;
    if v_phone is not null then
      select p.id into v_patient
      from public.personal_patients p
      where p.clinician_id = v_clinician
        and regexp_replace(coalesce(p.phone, ''), '[^0-9]', '', 'g') =
            regexp_replace(v_phone, '[^0-9]', '', 'g')
        and regexp_replace(v_phone, '[^0-9]', '', 'g') <> ''
      order by p.created_at desc
      limit 1;
    end if;
    if v_patient is null then
      select p.id into v_patient
      from public.personal_patients p
      where p.clinician_id = v_clinician
        and lower(trim(p.full_name)) = lower(v_name)
      order by p.created_at desc
      limit 1;
    end if;
    if v_patient is null then
      insert into public.personal_patients (clinician_id, full_name, phone, email)
      values (v_clinician, v_name, v_phone, v_email)
      returning id into v_patient;
    end if;

    v_plan := null;
    if v_title is not null and v_sessions is not null and v_fee is not null then
      select p.id into v_plan
      from public.personal_patient_plans p
      where p.clinician_id = v_clinician
        and p.patient_id = v_patient
        and p.plan_type = 'package'
        and p.title = v_title
        and p.package_sessions = v_sessions
        and p.package_fee = v_fee
      order by p.created_at desc
      limit 1;
      if v_plan is null then
        insert into public.personal_patient_plans (
          clinician_id, patient_id, plan_type, title, package_sessions, package_fee
        ) values (
          v_clinician, v_patient, 'package', v_title, v_sessions, v_fee
        ) returning id into v_plan;
      end if;
    end if;

    if v_session_date is not null then
      if not exists (
        select 1 from public.personal_patient_sessions s
        where s.clinician_id = v_clinician
          and s.patient_id = v_patient
          and s.session_date = v_session_date
          and coalesce(s.session_label, '') = coalesce(v_session_label, '')
      ) then
        insert into public.personal_patient_sessions (
          clinician_id, patient_id, plan_id, session_date, status,
          session_label, charge_amount
        ) values (
          v_clinician, v_patient, v_plan, v_session_date, 'scheduled',
          coalesce(v_session_label, 'Imported session'), 0
        ) returning id into v_session_id;
        if v_session_status in ('completed','cancelled','rescheduled') then
          update public.personal_patient_sessions
          set status = v_session_status,
              completed_at = case when v_session_status = 'completed' then now() else null end
          where id = v_session_id
            and clinician_id = v_clinician
            and patient_id = v_patient;
        end if;
      end if;
    end if;

    if coalesce(v_payment, 0) > 0 then
      v_reference := 'personal-patient-import:' || p_batch_id || ':row:' || v_source_row::text;
      insert into public.personal_patient_ledger (
        clinician_id, patient_id, entry_type, amount, description, reference
      ) values (
        v_clinician, v_patient, 'payment', -v_payment,
        'Payment imported from file', v_reference
      ) on conflict (clinician_id, reference)
        where reference like 'personal-patient-import:%'
        do nothing;
    end if;

    v_imported := v_imported + 1;
  end loop;

  return v_imported;
end;
$$;

revoke all on function public.import_personal_patient_batch(jsonb, text) from public, anon;
grant execute on function public.import_personal_patient_batch(jsonb, text) to authenticated;
