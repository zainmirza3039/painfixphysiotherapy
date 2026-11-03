begin;

drop policy if exists "Admins can read contact messages" on public.contact_submissions;
create policy "Admins can read contact messages" on public.contact_submissions
for select to authenticated using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update contact messages" on public.contact_submissions;
create policy "Admins can update contact messages" on public.contact_submissions
for update to authenticated using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can delete contact messages" on public.contact_submissions;
create policy "Admins can delete contact messages" on public.contact_submissions
for delete to authenticated using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can write posts" on public.blog_posts;
create policy "Admins can write posts" on public.blog_posts
for all to authenticated using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Authors can manage own posts" on public.blog_posts;
create policy "Authors can manage own posts" on public.blog_posts
for all to authenticated
using (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
with check (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())));

drop policy if exists "Admins can delete clinic gallery items" on public.site_gallery;
create policy "Admins can delete clinic gallery items" on public.site_gallery
for delete to authenticated using (public.is_admin((select auth.uid())));

drop policy if exists "Admins can insert clinic gallery items" on public.site_gallery;
create policy "Admins can insert clinic gallery items" on public.site_gallery
for insert to authenticated with check (public.is_admin((select auth.uid())));

drop policy if exists "Admins can update clinic gallery items" on public.site_gallery;
create policy "Admins can update clinic gallery items" on public.site_gallery
for update to authenticated using (public.is_admin((select auth.uid())))
with check (public.is_admin((select auth.uid())));

drop policy if exists "Authenticated can read clinic gallery" on public.site_gallery;
create policy "Authenticated can read clinic gallery" on public.site_gallery
for select to authenticated using (is_active = true or public.is_admin((select auth.uid())));

create index if not exists certificate_events_actor_id_idx on public.certificate_events(actor_id);
create index if not exists certificates_experience_record_id_idx on public.certificates(experience_record_id);
create index if not exists certificates_participant_id_idx on public.certificates(participant_id);
create index if not exists clinician_photo_assets_clinician_profile_id_idx on public.clinician_photo_assets(clinician_profile_id);
create index if not exists clinician_profiles_photo_path_id_idx on public.clinician_profiles(photo_path,id);
create index if not exists internship_audit_events_actor_id_idx on public.internship_audit_events(actor_id);
create index if not exists internship_participants_application_program_idx on public.internship_participants(application_id,program_id);
create index if not exists internship_participants_program_id_idx on public.internship_participants(program_id);
create index if not exists internship_participants_reviewer_id_idx on public.internship_participants(reviewer_id);
create index if not exists professional_experience_records_approver_id_idx on public.professional_experience_records(approver_id);

commit;
