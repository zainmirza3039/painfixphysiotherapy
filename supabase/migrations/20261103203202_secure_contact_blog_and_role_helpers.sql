begin;

drop policy if exists "Staff can read contact messages" on public.contact_submissions;

drop policy if exists "Admins can read all posts" on public.blog_posts;
drop policy if exists "Authors can read own posts" on public.blog_posts;
drop policy if exists "admin manage blogs" on public.blog_posts;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select (auth.role() = 'service_role' or _user_id = auth.uid())
  and exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('admin','super_admin'));
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select (auth.role() = 'service_role' or _user_id = auth.uid())
  and exists (select 1 from public.user_roles where user_id = _user_id and role::text in ('admin','super_admin','staff'));
$$;

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean language sql stable security definer set search_path = public
as $$
  select (auth.role() = 'service_role' or _user_id = auth.uid())
  and exists (select 1 from public.user_roles where user_id = _user_id and role::text = _role);
$$;

create or replace function public.can_edit_content(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select (auth.role() = 'service_role' or _user_id = auth.uid())
  and exists (
    select 1 from public.user_roles
    where user_id = _user_id
    and role::text in ('admin','super_admin','content_editor','clinical_physiotherapist','dietitian','fitness_professional')
  );
$$;

revoke all on function public.is_admin(uuid) from public, anon;
revoke all on function public.is_staff(uuid) from public, anon;
revoke all on function public.has_role(uuid, text) from public, anon;
revoke all on function public.can_edit_content(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated, service_role;
grant execute on function public.is_staff(uuid) to authenticated, service_role;
grant execute on function public.has_role(uuid, text) to authenticated, service_role;
grant execute on function public.can_edit_content(uuid) to authenticated, service_role;

commit;
