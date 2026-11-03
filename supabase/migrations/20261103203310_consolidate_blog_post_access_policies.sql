begin;
drop policy if exists "Admins can write posts" on public.blog_posts;
drop policy if exists "Authors can manage own posts" on public.blog_posts;
drop policy if exists "public read published blogs" on public.blog_posts;

create policy "Blog readers can view published or authorized posts"
on public.blog_posts for select to anon, authenticated
using (
  (status = 'published' and (publish_at is null or publish_at <= now()))
  or (
    (select auth.uid()) is not null
    and (
      public.is_admin((select auth.uid()))
      or (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
    )
  )
);

create policy "Authorized users can create blog posts"
on public.blog_posts for insert to authenticated
with check (
  public.is_admin((select auth.uid()))
  or (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
);

create policy "Authorized users can update blog posts"
on public.blog_posts for update to authenticated
using (
  public.is_admin((select auth.uid()))
  or (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
)
with check (
  public.is_admin((select auth.uid()))
  or (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
);

create policy "Authorized users can delete blog posts"
on public.blog_posts for delete to authenticated
using (
  public.is_admin((select auth.uid()))
  or (author_id = (select auth.uid()) and public.can_edit_content((select auth.uid())))
);
commit;
