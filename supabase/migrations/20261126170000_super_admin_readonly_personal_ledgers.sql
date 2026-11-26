-- Super Admin read-only access to clinician-owned personal patient ledgers.
-- No direct table SELECT policies are broadened; all cross-clinician reads go through
-- narrowly scoped SECURITY DEFINER functions that verify the caller's exact role.
create or replace function public.super_admin_personal_ledger_clinicians()
returns table (
  clinician_id uuid,
  full_name text,
  professional_title text,
  patient_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role::text = 'super_admin'
  ) then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;

  return query
  select
    p.user_id,
    coalesce(nullif(p.full_name, ''), 'Clinical Physiotherapist'),
    p.professional_title,
    count(pp.id)::bigint
  from public.user_roles ur
  left join public.profiles p on p.user_id = ur.user_id
  left join public.personal_patients pp on pp.clinician_id = ur.user_id
  where ur.role::text = 'clinical_physiotherapist'
  group by p.user_id, p.full_name, p.professional_title
  order by coalesce(nullif(p.full_name, ''), 'Clinical Physiotherapist');
end;
$$;

create or replace function public.super_admin_personal_ledger_snapshot(_clinician_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role::text = 'super_admin'
  ) then
    raise exception 'Super Admin access required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = _clinician_id and ur.role::text = 'clinical_physiotherapist'
  ) then
    raise exception 'Clinical Physiotherapist account not found' using errcode = '22023';
  end if;

  select jsonb_build_object(
    'clinician', (
      select jsonb_build_object(
        'clinician_id', p.user_id,
        'full_name', coalesce(nullif(p.full_name, ''), 'Clinical Physiotherapist'),
        'professional_title', p.professional_title
      )
      from public.profiles p where p.user_id = _clinician_id
    ),
    'patients', coalesce((
      select jsonb_agg(to_jsonb(pp) order by pp.created_at desc)
      from public.personal_patients pp where pp.clinician_id = _clinician_id
    ), '[]'::jsonb),
    'plans', coalesce((
      select jsonb_agg(to_jsonb(pl) order by pl.created_at desc)
      from public.personal_patient_plans pl where pl.clinician_id = _clinician_id
    ), '[]'::jsonb),
    'sessions', coalesce((
      select jsonb_agg(to_jsonb(s) order by s.session_date desc)
      from public.personal_patient_sessions s where s.clinician_id = _clinician_id
    ), '[]'::jsonb),
    'ledger', coalesce((
      select jsonb_agg(to_jsonb(l) order by l.occurred_at desc)
      from public.personal_patient_ledger l where l.clinician_id = _clinician_id
    ), '[]'::jsonb),
    'calendar_blocks', coalesce((
      select jsonb_agg(to_jsonb(b) order by b.block_date)
      from public.personal_patient_calendar_blocks b where b.clinician_id = _clinician_id
    ), '[]'::jsonb),
    'audit_events', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.created_at desc)
      from public.personal_patient_audit_events a where a.clinician_id = _clinician_id
    ), '[]'::jsonb)
  ) into result;

  return coalesce(result, '{}'::jsonb);
end;
$$;

revoke all on function public.super_admin_personal_ledger_clinicians() from public, anon;
revoke all on function public.super_admin_personal_ledger_snapshot(uuid) from public, anon;
grant execute on function public.super_admin_personal_ledger_clinicians() to authenticated;
grant execute on function public.super_admin_personal_ledger_snapshot(uuid) to authenticated;

comment on function public.super_admin_personal_ledger_clinicians() is
  'Super Admin-only read-only list of Clinical Physiotherapist personal ledgers.';
comment on function public.super_admin_personal_ledger_snapshot(uuid) is
  'Super Admin-only read-only snapshot of one Clinical Physiotherapist personal ledger.';
