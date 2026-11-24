-- Record a reviewed attendance batch atomically.
-- Session rows start as scheduled and are completed inside the same transaction;
-- the existing completion trigger posts the corresponding ledger charge.
create or replace function public.record_personal_patient_attendance_batch(
  p_rows jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_clinician uuid := auth.uid();
  v_row jsonb;
  v_patient_id uuid;
  v_plan_id uuid;
  v_plan_type text;
  v_session_date timestamptz;
  v_charge numeric(12,2);
  v_label text;
  v_session_id uuid;
  v_count integer := 0;
begin
  if v_clinician is null then
    raise exception 'Authentication required.';
  end if;
  if p_rows is null or jsonb_typeof(p_rows) is distinct from 'array'
     or jsonb_array_length(p_rows) = 0 then
    raise exception 'Select at least one patient before confirming attendance.';
  end if;
  if jsonb_array_length(p_rows) > 250 then
    raise exception 'Attendance batches are limited to 250 patients.';
  end if;

  for v_row in select value from jsonb_array_elements(p_rows)
  loop
    v_patient_id := nullif(v_row->>'patient_id', '')::uuid;
    v_session_date := nullif(v_row->>'session_date', '')::timestamptz;
    v_charge := coalesce(nullif(v_row->>'charge_amount', '')::numeric, 0);
    v_label := coalesce(nullif(trim(v_row->>'session_label'), ''), 'Physiotherapy session');

    if v_patient_id is null or v_session_date is null then
      raise exception 'Every attendance row must include a patient and date/time.';
    end if;
    if v_charge < 0 or v_charge > 10000000 then
      raise exception 'Session fee must be between 0 and 10,000,000 PKR.';
    end if;
    if length(v_label) > 160 then
      raise exception 'Session label is too long.';
    end if;

    if not exists (
      select 1 from public.personal_patients p
      where p.id = v_patient_id
        and p.clinician_id = v_clinician
        and p.status = 'active'
    ) then
      raise exception 'A selected patient is unavailable or no longer active.';
    end if;

    select plan.id, plan.plan_type
      into v_plan_id, v_plan_type
    from public.personal_patient_plans plan
    where plan.patient_id = v_patient_id
      and plan.clinician_id = v_clinician
      and plan.is_active = true
    order by plan.created_at desc
    limit 1;

    -- Package fees are charged when the plan is created, not again per visit.
    if v_plan_type = 'package' and v_charge <> 0 then
      raise exception 'Package sessions are already prepaid. Set the session fee to zero.';
    end if;

    insert into public.personal_patient_sessions (
      clinician_id, patient_id, plan_id, session_date, status,
      session_label, charge_amount
    ) values (
      v_clinician, v_patient_id, v_plan_id, v_session_date, 'scheduled',
      v_label, v_charge
    ) returning id into v_session_id;

    update public.personal_patient_sessions
      set status = 'completed'
    where id = v_session_id
      and patient_id = v_patient_id
      and clinician_id = v_clinician;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.record_personal_patient_attendance_batch(jsonb) from public, anon;
grant execute on function public.record_personal_patient_attendance_batch(jsonb) to authenticated;
