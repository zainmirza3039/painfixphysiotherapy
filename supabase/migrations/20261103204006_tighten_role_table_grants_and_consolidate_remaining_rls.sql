begin;
revoke all privileges on table public.user_roles from anon, authenticated;
grant select on table public.user_roles to authenticated;

revoke all privileges on table
  public.certificate_events, public.certificates, public.clinician_photo_assets,
  public.internship_applications, public.internship_audit_events,
  public.internship_participants, public.internship_public_rate_limits,
  public.professional_experience_records
from anon, authenticated;
grant all privileges on table
  public.certificate_events, public.certificates, public.clinician_photo_assets,
  public.internship_applications, public.internship_audit_events,
  public.internship_participants, public.internship_public_rate_limits,
  public.professional_experience_records
to service_role;

drop policy if exists "staff read appointments" on public.appointments;
drop policy if exists "staff read patients" on public.patients;

drop policy if exists "staff manage calculators" on public.calculator_settings;
create policy "staff insert calculators" on public.calculator_settings for insert to authenticated
with check (public.is_staff((select auth.uid())));
create policy "staff update calculators" on public.calculator_settings for update to authenticated
using (public.is_staff((select auth.uid()))) with check (public.is_staff((select auth.uid())));
create policy "staff delete calculators" on public.calculator_settings for delete to authenticated
using (public.is_staff((select auth.uid())));

drop policy if exists "public fitness content" on public.fitness_content;
drop policy if exists "staff manage fitness" on public.fitness_content;
create policy "read published fitness or staff content" on public.fitness_content
for select to anon, authenticated
using (status = 'published' or ((select auth.uid()) is not null and public.is_staff((select auth.uid()))));
create policy "staff insert fitness" on public.fitness_content for insert to authenticated
with check (public.is_staff((select auth.uid())));
create policy "staff update fitness" on public.fitness_content for update to authenticated
using (public.is_staff((select auth.uid()))) with check (public.is_staff((select auth.uid())));
create policy "staff delete fitness" on public.fitness_content for delete to authenticated
using (public.is_staff((select auth.uid())));

drop policy if exists "Users can create own profile" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "admin manage profiles" on public.profiles;
drop policy if exists "public view profiles" on public.profiles;
create policy "read public own or admin profiles" on public.profiles for select to anon, authenticated
using (is_published = true or user_id = (select auth.uid()) or ((select auth.uid()) is not null and public.is_admin((select auth.uid()))));
create policy "users or admins insert profiles" on public.profiles for insert to authenticated
with check (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "users or admins update profiles" on public.profiles for update to authenticated
using (user_id = (select auth.uid()) or public.is_admin((select auth.uid())))
with check (user_id = (select auth.uid()) or public.is_admin((select auth.uid())));
create policy "admins delete profiles" on public.profiles for delete to authenticated
using (public.is_admin((select auth.uid())));
commit;
