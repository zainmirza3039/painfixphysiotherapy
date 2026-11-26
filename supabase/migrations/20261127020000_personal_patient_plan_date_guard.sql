-- Enforce billing-plan validity at the database boundary as well as in the UI.
-- Session dates are interpreted in the clinic's local timezone (Multan, Pakistan).
create or replace function public.enforce_personal_patient_session_plan_dates()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_starts_on date;
  v_ends_on date;
  v_session_day date;
begin
  if new.plan_id is null then
    return new;
  end if;

  select p.starts_on, p.ends_on
    into v_starts_on, v_ends_on
  from public.personal_patient_plans p
  where p.id = new.plan_id
    and p.patient_id = new.patient_id
    and p.clinician_id = new.clinician_id;

  if not found then
    raise exception 'The selected billing plan does not belong to this patient.';
  end if;

  v_session_day := (new.session_date at time zone 'Asia/Karachi')::date;

  if v_starts_on is not null and v_session_day < v_starts_on then
    raise exception 'Session date is before the billing plan start date.';
  end if;

  if v_ends_on is not null and v_session_day > v_ends_on then
    raise exception 'Session date is after the billing plan end date.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_personal_patient_session_plan_dates() from public, anon;
grant execute on function public.enforce_personal_patient_session_plan_dates() to authenticated;

drop trigger if exists personal_patient_session_plan_dates_guard
  on public.personal_patient_sessions;

create trigger personal_patient_session_plan_dates_guard
before insert or update of plan_id, patient_id, clinician_id, session_date
on public.personal_patient_sessions
for each row
execute function public.enforce_personal_patient_session_plan_dates();
