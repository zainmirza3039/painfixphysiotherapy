-- Interactive date controls for the private personal-patient calendar.
-- Scheduled sessions are soft-deleted so audit and billing relationships remain intact.
alter table public.personal_patient_sessions
  add column if not exists deleted_at timestamptz;

create index if not exists personal_patient_sessions_visible_patient_date_idx
  on public.personal_patient_sessions (patient_id, session_date)
  where deleted_at is null;

create table if not exists public.personal_patient_calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  clinician_id uuid not null references auth.users(id) on delete restrict,
  patient_id uuid not null,
  block_date date not null,
  block_type text not null check (block_type in ('off', 'leave')),
  note text check (note is null or char_length(note) <= 240),
  created_at timestamptz not null default now(),
  constraint personal_patient_calendar_blocks_patient_fk
    foreign key (patient_id, clinician_id)
    references public.personal_patients(id, clinician_id)
    on delete restrict,
  constraint personal_patient_calendar_blocks_unique_date
    unique (patient_id, block_date)
);

create index if not exists personal_patient_calendar_blocks_owner_date_idx
  on public.personal_patient_calendar_blocks (clinician_id, block_date);

alter table public.personal_patient_calendar_blocks enable row level security;

create policy "Clinicians read their personal patient calendar blocks"
on public.personal_patient_calendar_blocks for select to authenticated
using ((select auth.uid()) = clinician_id);

create policy "Clinicians add their personal patient calendar blocks"
on public.personal_patient_calendar_blocks for insert to authenticated
with check (
  (select auth.uid()) = clinician_id
  and exists (
    select 1 from public.personal_patients p
    where p.id = patient_id and p.clinician_id = (select auth.uid())
  )
);

create policy "Clinicians remove their personal patient calendar blocks"
on public.personal_patient_calendar_blocks for delete to authenticated
using ((select auth.uid()) = clinician_id);

revoke all on public.personal_patient_calendar_blocks from anon;
grant select, insert, delete on public.personal_patient_calendar_blocks to authenticated;
