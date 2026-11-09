-- Personal patient ledger: isolated from the clinic-wide patients workflow.
-- Every row is owned by an authenticated clinician so future doctors cannot see
-- one another's records. No public/anon policies are created in this migration.

create table if not exists public.personal_patients (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  full_name text not null check (length(trim(full_name)) between 1 and 160),
  phone text,
  email text,
  private_notes text,
  status text not null default 'active' check (status in ('active','on_hold','discharged','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, clinician_id)
);

create index if not exists personal_patients_owner_created_idx
  on public.personal_patients (clinician_id, created_at desc);
create index if not exists personal_patients_owner_status_idx
  on public.personal_patients (clinician_id, status);

create table if not exists public.personal_patient_plans (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null references public.personal_patients(id) on delete restrict,
  plan_type text not null check (plan_type in ('package','per_session','custom')),
  title text not null,
  package_sessions integer check (package_sessions is null or package_sessions > 0),
  package_fee numeric(12,2) check (package_fee is null or package_fee >= 0),
  per_session_fee numeric(12,2) check (per_session_fee is null or per_session_fee >= 0),
  currency text not null default 'PKR' check (currency = 'PKR'),
  starts_on date,
  ends_on date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, clinician_id),
  constraint personal_patient_plans_owner_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict
);

create table if not exists public.personal_patient_sessions (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  plan_id uuid,
  session_date timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','completed','cancelled','rescheduled')),
  session_label text,
  charge_amount numeric(12,2) not null default 0 check (charge_amount >= 0),
  private_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, clinician_id),
  constraint personal_patient_sessions_owner_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict,
  constraint personal_patient_sessions_plan_fk
    foreign key (plan_id, clinician_id) references public.personal_patient_plans(id, clinician_id)
    on delete restrict
);

create index if not exists personal_patient_sessions_owner_date_idx
  on public.personal_patient_sessions (clinician_id, session_date desc);
create index if not exists personal_patient_sessions_patient_date_idx
  on public.personal_patient_sessions (patient_id, session_date desc);

-- Signed accounting convention: positive amount increases the patient's due;
-- negative amount is a payment/credit that reduces due. Each row is immutable.
create table if not exists public.personal_patient_ledger (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  session_id uuid,
  entry_type text not null check (entry_type in ('charge','payment','credit','refund','adjustment')),
  amount numeric(12,2) not null check (
    (entry_type in ('charge','refund') and amount > 0)
    or (entry_type in ('payment','credit') and amount < 0)
    or entry_type = 'adjustment'
  ),
  description text not null,
  payment_method text check (payment_method is null or payment_method in ('cash','bank_transfer','jazzcash','easypaisa','card','other')),
  reference text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint personal_patient_ledger_session_fk
    foreign key (session_id, clinician_id)
    references public.personal_patient_sessions(id, clinician_id) on delete restrict,
  constraint personal_patient_ledger_owner_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict
);

create index if not exists personal_patient_ledger_owner_date_idx
  on public.personal_patient_ledger (clinician_id, occurred_at desc);
create index if not exists personal_patient_ledger_patient_date_idx
  on public.personal_patient_ledger (patient_id, occurred_at desc);

-- Private portal credentials are only readable/writable by the owning clinician.
-- The opaque token digest and bcrypt PIN hash are never exposed to anon clients.
create table if not exists public.personal_patient_portal_credentials (
  patient_id uuid primary key,
  clinician_id uuid not null references auth.users(id) on delete restrict,
  token_digest text not null unique,
  pin_hash text not null,
  is_revoked boolean not null default false,
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint personal_patient_portal_owner_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict
);

create table if not exists public.personal_patient_audit_events (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  entity_type text not null check (entity_type in ('patient','plan','session','ledger','portal')),
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint personal_patient_audit_owner_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict
);

create index if not exists personal_patient_audit_owner_patient_date_idx
  on public.personal_patient_audit_events (clinician_id, patient_id, created_at desc);

-- updated_at is maintained by the database.
create or replace function public.set_personal_patient_updated_at()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists personal_patients_updated_at on public.personal_patients;
create trigger personal_patients_updated_at before update on public.personal_patients
for each row execute function public.set_personal_patient_updated_at();

drop trigger if exists personal_patient_sessions_updated_at on public.personal_patient_sessions;
create trigger personal_patient_sessions_updated_at before update on public.personal_patient_sessions
for each row execute function public.set_personal_patient_updated_at();

drop trigger if exists personal_patient_portal_credentials_updated_at on public.personal_patient_portal_credentials;
create trigger personal_patient_portal_credentials_updated_at before update on public.personal_patient_portal_credentials
for each row execute function public.set_personal_patient_updated_at();

-- Immutable ledger and audit trail: corrections must be new compensating entries.
create or replace function public.reject_personal_patient_history_mutation()
returns trigger language plpgsql set search_path = ''
as $$
begin
  raise exception 'Financial and audit history is immutable; add a correcting entry instead.';
end;
$$;

drop trigger if exists personal_patient_ledger_immutable on public.personal_patient_ledger;
create trigger personal_patient_ledger_immutable before update or delete on public.personal_patient_ledger
for each row execute function public.reject_personal_patient_history_mutation();

drop trigger if exists personal_patient_audit_immutable on public.personal_patient_audit_events;
create trigger personal_patient_audit_immutable before update or delete on public.personal_patient_audit_events
for each row execute function public.reject_personal_patient_history_mutation();

alter table public.personal_patients enable row level security;
alter table public.personal_patient_plans enable row level security;
alter table public.personal_patient_sessions enable row level security;
alter table public.personal_patient_ledger enable row level security;
alter table public.personal_patient_portal_credentials enable row level security;
alter table public.personal_patient_audit_events enable row level security;

create policy "Clinicians manage only their personal patients"
on public.personal_patients for all to authenticated
using ((select auth.uid()) = clinician_id)
with check ((select auth.uid()) = clinician_id);

create policy "Clinicians manage only their personal patient plans"
on public.personal_patient_plans for all to authenticated
using ((select auth.uid()) = clinician_id)
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

create policy "Clinicians manage only their personal patient sessions"
on public.personal_patient_sessions for all to authenticated
using ((select auth.uid()) = clinician_id)
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

create policy "Clinicians manage only their personal patient ledger"
on public.personal_patient_ledger for select to authenticated
using ((select auth.uid()) = clinician_id);

create policy "Clinicians add ledger entries only for their patients"
on public.personal_patient_ledger for insert to authenticated
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

create policy "Clinicians manage only their personal patient portal credentials"
on public.personal_patient_portal_credentials for all to authenticated
using ((select auth.uid()) = clinician_id)
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

create policy "Clinicians view only their personal patient audit history"
on public.personal_patient_audit_events for select to authenticated
using ((select auth.uid()) = clinician_id);

create policy "Clinicians append audit events for their own patients"
on public.personal_patient_audit_events for insert to authenticated
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

revoke all on public.personal_patients, public.personal_patient_plans,
  public.personal_patient_sessions, public.personal_patient_ledger,
  public.personal_patient_portal_credentials, public.personal_patient_audit_events
from anon;

grant select, insert, update on public.personal_patients to authenticated;
grant select, insert, update on public.personal_patient_plans to authenticated;
grant select, insert, update on public.personal_patient_sessions to authenticated;
grant select, insert on public.personal_patient_ledger to authenticated;
grant select, insert, update on public.personal_patient_portal_credentials to authenticated;
grant select, insert on public.personal_patient_audit_events to authenticated;

-- Explicitly do not grant anonymous access. Patient-link access will be served
-- through a separately reviewed server endpoint, never direct table access.
