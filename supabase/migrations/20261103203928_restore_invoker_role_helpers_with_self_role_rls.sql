create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$
  select (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or _user_id = auth.uid()
  ) and exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text in ('admin','super_admin')
  );
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$
  select (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or _user_id = auth.uid()
  ) and exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text in ('admin','super_admin','staff')
  );
$$;

create or replace function public.has_role(_user_id uuid, _role text)
returns boolean language sql stable security invoker set search_path = public
as $$
  select (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or _user_id = auth.uid()
  ) and exists (
    select 1 from public.user_roles
    where user_id = _user_id and role::text = _role
  );
$$;

create or replace function public.can_edit_content(_user_id uuid)
returns boolean language sql stable security invoker set search_path = public
as $$
  select (
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    or _user_id = auth.uid()
  ) and exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role::text in ('admin','super_admin','content_editor','clinical_physiotherapist','dietitian','fitness_professional')
  );
$$;
